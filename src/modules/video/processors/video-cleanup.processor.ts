import * as path from 'path';
import { Stats } from 'fs';

import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import chalk from 'chalk';
import { ConfigService } from '@nestjs/config';
import { StorageService } from 'src/modules/storage/storage.service';
import * as disk from 'diskusage';

import { VideoService } from '../video.service';
import { Video } from '../domain/video.domain';

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
    this.logger.log(chalk.blue('Starting video cleanup...'));

    const keepHours = this.configService.get<number>('VIDEO_KEEP_HOURS', 72);
    const videosDir = this.configService.get<string>('VIDEOS_DIR', './videos');
    const now = Date.now();
    const threshold = now - keepHours * 60 * 60 * 1000;

    try {
      await this.sweepTopLevelForIpFolders(videosDir, threshold);
      this.logger.log(chalk.blue('Video cleanup done.'));
    } catch (err) {
      this.logger.error('Error cleaning up old videos', err);
    }
  }

  @Process('checkDiskSpace')
  async handleCheckDiskSpace() {
    this.logger.log(chalk.blue(`Starting disk space check...`));
    const minFreeSpacePercent = this.configService.get<number>('MIN_FREE_SPACE_PERCENT', 10);
    const videosDir = this.configService.get<string>('VIDEOS_DIR', './videos');

    let usage: disk.DiskUsage;
    try {
      usage = await disk.check(videosDir);
    } catch (err) {
      this.logger.error(`Error getting disk usage for ${videosDir}:`, err);
      return;
    }

    const { free, total } = usage;

    const freePercent = (free / total) * 100;

    this.logger.log(
      `Disk usage for ${videosDir}: free=${free} of total=${total} (~${freePercent.toFixed(2)}%)`,
    );

    if (freePercent < minFreeSpacePercent) {
      this.logger.warn(`Free disk space is below ${minFreeSpacePercent}%. Starting cleanup...`);

      await this.cleanupUntilSafe(videosDir, minFreeSpacePercent);
    } else {
      this.logger.log(chalk.blue('Disk space is sufficient, no cleanup required.'));
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
    if (mtimeMs < thresholdMs) {
      const relativeFilePath = path.relative(videosDir, fullPath);
      const filePath = path.join('videos', relativeFilePath);

      await this.storageService.removeFile(fullPath);
      await this.videoService.deleteVideoRecord(filePath);
    }
  }

  private async cleanupUntilSafe(rootPath: string, minFreeSpacePercent: number) {
    let usage = await disk.check(rootPath);
    let freePercent = (usage.free / usage.total) * 100;

    while (freePercent < minFreeSpacePercent) {
      const oldest: Video = await this.videoService.getOldestVideoRecord();
      if (!oldest) {
        this.logger.warn('No more video records to delete, but space is still low.');
        break;
      }

      await this.videoService.removeVideoRecordAndFile(oldest.id);

      usage = await disk.check(rootPath);
      freePercent = (usage.free / usage.total) * 100;

      this.logger.log(
        `Removed file=${oldest.filePath}. Now free=${usage.free} (~${freePercent.toFixed(2)}%).`,
      );
    }

    this.logger.log(`Cleanup finished. Current free space: ~${freePercent.toFixed(2)}%.`);
  }
}
