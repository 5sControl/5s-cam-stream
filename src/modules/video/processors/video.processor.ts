/* eslint-disable @typescript-eslint/no-explicit-any */

import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import Ffmpeg from 'fluent-ffmpeg';
import { Logger } from '@nestjs/common';

import { ChunkInfo } from '../models/interfaces/chunk-info.interface';

@Processor('video')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);
  @Process({ name: 'convert' })
  async handleConversion(job: Job<ChunkInfo>) {
    const { filePath, chunkOutputPath, chunkStartTime, chunkDuration, segmentInputOffset } =
      job.data;

    await this.runFfmpeg(
      filePath,
      chunkOutputPath,
      chunkStartTime,
      chunkDuration,
      segmentInputOffset,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: any) {
    const filePath: number = job.data.filePath;
    this.logger.log(`Job ${filePath} in queue ${job.name} completed failed.${error.message}`);
  }

  @OnQueueCompleted()
  handleQueueCompleted(job: Job) {
    const filePath: string = job.data.filePath;
    this.logger.log(`Job ${filePath} in queue ${job.name} completed successfully.`);
  }

  @OnQueueActive()
  handleQueueActive(job: Job) {
    const filePath: string = job.data.filePath;
    this.logger.log(`Job ${filePath} in queue ${job.name} is now active.`);
  }

  private runFfmpeg(
    filePath: string,
    chunkOutputPath: string,
    chunkStartTime: number,
    chunkDuration: number,
    segmentInputOffset: number,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let command = Ffmpeg()
        .input(filePath)
        .inputOptions([`-ss ${segmentInputOffset}`, `-t ${chunkDuration}`]);

      const videoFilter = `setpts=PTS-STARTPTS+${chunkStartTime}/TB`;
      const audioFilter = `asetpts=PTS-STARTPTS+${chunkStartTime}/TB`;

      command
        .videoCodec('libx264')
        .videoFilter(videoFilter)
        .audioCodec('aac')
        .audioFilter(audioFilter)
        .outputOptions(['-preset', 'fast', '-crf', '30'])
        .format('mpegts')
        .output(chunkOutputPath)
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  // private runFfmpeg(
  //   filePath: string,
  //   chunkOutputPath: string,
  //   chunkDuration: number,
  //   segmentInputOffset: number,
  // ): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     console.log(filePath, chunkOutputPath, chunkDuration, segmentInputOffset, 1);
  //     const command = Ffmpeg(filePath)
  //       .inputOptions([`-ss ${segmentInputOffset}`])
  //       .videoCodec('copy')
  //       .audioCodec('copy')
  //       .outputOptions([`-t ${chunkDuration}`])
  //       .format('mpegts')
  //       .output(chunkOutputPath)

  //       .on('end', () => resolve(true))
  //       .on('error', (err) => reject(err));

  //     command.run();
  //   });
  // }
}
