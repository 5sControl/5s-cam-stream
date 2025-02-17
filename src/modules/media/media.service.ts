/* eslint-disable @typescript-eslint/no-unused-vars */

import { once } from 'events';

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import { buildRtspUrl } from 'src/common/utils/build-rtsp-url.util';
import { EMPTY, Observable, Subscription, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { StorageService } from '../storage/storage.service';

import { SnapshotResult } from './models/interfaces/snapshot-result.interface';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  private recordingProcesses: Map<string, ffmpeg.FfmpegCommand> = new Map();

  private recordingSubscriptions: Map<string, Subscription> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  async captureSnapshot(
    cameraIp: string,
    rtspUrl: string,
    imagesUrl: string,
    outputPath: string,
  ): Promise<SnapshotResult> {
    const command = ffmpeg(rtspUrl)
      .inputOptions('-rtsp_transport tcp')
      .outputOptions(['-vframes 1', '-f image2'])
      .save(outputPath);

    await Promise.race([
      once(command, 'end'),
      once(command, 'error').then(([err]) => {
        throw err;
      }),
    ]);

    const snapshotUrl = `${imagesUrl}/${cameraIp}/snapshot.jpg`;
    return { url: snapshotUrl };
  }

  async startRecording(
    cameraIp: string,
    rtspUrl: string,
    recordDuration: string,
  ): Promise<ffmpeg.FfmpegCommand> {
    try {
      const { outputDir, outputPattern } =
        await this.storageService.prepareRecordingFolder(cameraIp);
      await this.storageService.startSegmentWatcher(cameraIp, outputDir, recordDuration);

      const command = ffmpeg(rtspUrl)
        .inputOptions('-rtsp_transport tcp')
        .outputOptions([
          '-f',
          'segment',
          '-segment_time',
          `${recordDuration}`,
          '-strftime',
          '1',
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          '30',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
        ])
        .save(outputPattern);

      return command;
    } catch (error) {
      this.logger.error(`Error starting recording for camera ${cameraIp}: ${error.message}`);
      throw error;
    }
  }

  async initiateRecording(
    cameraIp: string,
    rtspUrl: string,
    recordDuration: string,
  ): Promise<ffmpeg.FfmpegCommand> {
    const oldSub = this.recordingSubscriptions.get(cameraIp);
    if (oldSub) {
      oldSub.unsubscribe();
      this.recordingSubscriptions.delete(cameraIp);
    }

    return new Promise<ffmpeg.FfmpegCommand>((resolve, reject) => {
      let firstSuccess = false;

      const subscription = this.startRecordingWithReconnect(
        cameraIp,
        rtspUrl,
        recordDuration,
      ).subscribe({
        next: (command) => {
          if (!firstSuccess) {
            firstSuccess = true;
            this.recordingProcesses.set(cameraIp, command);
            this.logger.log(`Started recording for camera ${cameraIp}`);
            resolve(command);
          }
        },
      });
      this.recordingSubscriptions.set(cameraIp, subscription);
    });
  }

  private startRecordingWithReconnect(
    cameraIp: string,
    rtspUrl: string,
    recordDuration: string,
  ): Observable<ffmpeg.FfmpegCommand> {
    const retryDelays: number[] = this.getRetryDelays();

    return this.startRecordingObservable(cameraIp, rtspUrl, recordDuration).pipe(
      retry({
        count: retryDelays.length,
        delay: (error, retryAttempt) => {
          const delayTime = retryDelays[retryAttempt - 1] || retryDelays[retryDelays.length - 1];
          this.logger.error(
            `Recording error for camera ${cameraIp}. Attempt ${retryAttempt}. Reconnecting in ${delayTime / 1000} seconds...`,
          );
          return timer(delayTime);
        },
      }),
      catchError((err) => {
        this.logger.error(
          `Failed to connect to camera ${cameraIp} after all attempts. Check the connection to the camera. Error: ${err.message}`,
        );
        return EMPTY;
      }),
    );
  }

  private startRecordingObservable(
    cameraIp: string,
    rtspUrl: string,
    recordDuration: string,
  ): Observable<ffmpeg.FfmpegCommand> {
    return new Observable<ffmpeg.FfmpegCommand>((subscriber) => {
      this.startRecording(cameraIp, rtspUrl, recordDuration)
        .then((command) => {
          subscriber.next(command);

          command.on('error', (err) => {
            subscriber.error(err);
          });

          command.on('end', () => {
            subscriber.complete();
          });
        })
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }

  async stopRecording(ip: string): Promise<void> {
    const command = this.recordingProcesses.get(ip);

    if (!command) {
      this.logger.warn(`No active recording found for camera with IP ${ip}`);
      return;
    }

    try {
      command.kill('SIGTERM');
      this.logger.log(`Stopped recording for camera ${ip}`);
      this.recordingProcesses.delete(ip);
      this.storageService.stopSegmentWatcher(ip);

      const subscription = this.recordingSubscriptions.get(ip);
      if (subscription) {
        subscription.unsubscribe();
        this.recordingSubscriptions.delete(ip);
      }
    } catch (error) {
      this.logger.error(`Error stopping recording for camera ${ip}: ${error.message}`);
      throw new InternalServerErrorException(`Failed to stop recording, error: ${error.message}`);
    }
  }

  async getWorkingRtspUrl(username: string, password: string, cameraIp: string): Promise<string> {
    const rtspTemplatesString = this.configService.get<string>('RTSP_TEMPLATES', '');
    const templates = rtspTemplatesString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!templates.length) {
      throw new InternalServerErrorException('No RTSP templates configured in RTSP_TEMPLATES');
    }

    for (const template of templates) {
      const rtspUrl = buildRtspUrl(template, username, password, cameraIp);

      this.logger.debug(`Trying RTSP URL: ${rtspUrl}`);
      try {
        await this.testRtspUrl(rtspUrl);
        this.logger.debug(`RTSP URL is good: ${rtspUrl}`);
        return rtspUrl;
      } catch (err) {
        this.logger.warn(`RTSP template failed for camera ${cameraIp}: ${rtspUrl}`);
      }
    }

    throw new InternalServerErrorException(
      `No valid RTSP link found for camera ${cameraIp} with given templates`,
    );
  }

  private testRtspUrl(rtspUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = ffmpeg().input(rtspUrl).inputOptions('-t', '2');

      cmd.ffprobe((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private getRetryDelays(): number[] {
    const delaysString = this.configService.get<string>(
      'VIDEO_RETRY_DELAYS',
      '10000,180000,900900',
    );
    return delaysString.split(',').map((delay) => parseInt(delay.trim(), 10));
  }
}
