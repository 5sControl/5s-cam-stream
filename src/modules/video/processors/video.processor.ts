/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import Ffmpeg from 'fluent-ffmpeg';
import { Logger } from '@nestjs/common';

import { ChunkInfo } from '../models/interfaces/chunk-info.interface';

@Processor('video')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);
  @Process('convert')
  async handleConversion(job: Job<ChunkInfo>) {
    const { mp4Path, outTsPath, ss, t, inputOffset } = job.data;

    await this.runFfmpeg(mp4Path, outTsPath, ss, t, inputOffset);
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
    mp4Path: string,
    outTsPath: string,
    ss: number,
    t: number,
    inputOffset: number,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let command = Ffmpeg()
        .input(mp4Path)
        .inputOptions([`-ss ${inputOffset}`, `-t ${t}`]);

      const videoFilter = `setpts=PTS-STARTPTS+${ss}/TB`;
      const audioFilter = `asetpts=PTS-STARTPTS+${ss}/TB`;

      command
        .videoCodec('libx264')
        .videoFilter(videoFilter)
        .audioCodec('aac')
        .audioFilter(audioFilter)
        .outputOptions(['-preset', 'slow', '-crf', '30'])
        .format('mpegts')
        .output(outTsPath)
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
        .run();
    });
  }
}
