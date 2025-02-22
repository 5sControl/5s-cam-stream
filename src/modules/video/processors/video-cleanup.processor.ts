import * as path from 'path';
import { Stats } from 'fs';

import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from 'src/modules/storage/storage.service';

import { VideoService } from '../video.service';

@Processor('videoCleanup')
export class VideoCleanupProcessor {
  private readonly logger = new Logger(VideoCleanupProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly videoService: VideoService,
    private readonly storageService: StorageService,
  ) {}

  @Process('cleanupOldVideos')
  async handleCleanup() {
    this.logger.log('Starting video cleanup...');

    const keepHours = this.configService.get<number>('VIDEO_KEEP_HOURS', 72);
    const videosDir = this.configService.get<string>('VIDEOS_DIR', './videos');
    const now = Date.now();
    const threshold = now - keepHours * 60 * 60 * 1000;

    try {
      await this.sweepTopLevelForIpFolders(videosDir, threshold);
      this.logger.log('Video cleanup done.');
    } catch (err) {
      this.logger.error('Error cleaning up old videos', err);
    }
  }

  private async sweepTopLevelForIpFolders(videosDir: string, thresholdMs: number) {
    const entries = await this.storageService.readDirSafe(videosDir);
    const ipRegex = /^\d{1,3}(\.\d{1,3}){3}$/;

    for (const entry of entries) {
      const fullPath = path.join(videosDir, entry);

      const stat = await this.storageService.statSafe(fullPath);
      if (!stat) {
        continue;
      }

      if (stat.isDirectory()) {
        if (ipRegex.test(entry)) {
          await this.cleanupIpDirectory(fullPath, thresholdMs, videosDir);
        } else {
          this.logger.log(`Skipping non-IP folder: ${entry}`);
        }
      } else {
        this.logger.log(`Skipping file at top-level: ${entry}`);
      }
    }
  }

  private async cleanupIpDirectory(ipFolderPath: string, thresholdMs: number, videosDir: string) {
    const entries = await this.storageService.readDirSafe(ipFolderPath);

    for (const entry of entries) {
      const fullPath = path.join(ipFolderPath, entry);

      const stat = await this.storageService.statSafe(fullPath);
      if (!stat) {
        continue;
      }

      if (stat.isDirectory()) {
        const isTimespanFolder = /^\d+_\d+_\d+$/.test(entry);

        if (isTimespanFolder) {
          const parts = entry.split('_');
          const lastPart = parts[parts.length - 1];
          const lastTime = parseInt(lastPart, 10);

          if (!Number.isNaN(lastTime) && lastTime < thresholdMs) {
            await this.storageService.removeFolder(fullPath);
          }
        } else {
          await this.storageService.removeFolder(fullPath);
        }
      } else {
        await this.deleteIfOldFile(fullPath, stat, thresholdMs, videosDir);
      }
    }
  }

  private async deleteIfOldFile(
    fullPath: string,
    stat: Stats,
    thresholdMs: number,
    videosDir: string,
  ) {
    const ext = path.extname(fullPath).toLowerCase();
    if (ext !== '.mp4') {
      return;
    }
    const mtimeMs = stat.mtime.getTime();
    this.logger.log(`File mtime: ${mtimeMs} ${fullPath}`);
    if (mtimeMs < thresholdMs) {
      const relativeFilePath = path.relative(videosDir, fullPath);
      const filePath = path.join('videos', relativeFilePath);

      await this.storageService.removeFile(fullPath);
      await this.videoService.deleteVideoRecord(filePath);
    }
  }
}
