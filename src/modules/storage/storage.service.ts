import * as path from 'path';
import { promises as fs, FSWatcher, watch } from 'fs';

import moment from 'moment';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private segmentWatchers: Map<string, FSWatcher> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async prepareSnapshotFolder(cameraIp: string): Promise<{
    outputPath: string;
    imagesUrl: string;
  }> {
    const imagesDir = this.configService.get<string>('IMAGES_DIR', './images');
    const outputDir = path.join(imagesDir, cameraIp);
    const outputPath = path.join(outputDir, 'snapshot.jpg');
    const imagesUrl = this.configService.getOrThrow<string>('IMAGES_URL');
    await fs.mkdir(outputDir, { recursive: true });

    return { outputPath, imagesUrl };
  }

  async prepareRecordingFolder(cameraIp: string): Promise<{
    outputDir: string;
    outputPattern: string;
  }> {
    const videosDir = this.configService.get<string>('VIDEOS_DIR', './videos');
    const outputDir = path.join(videosDir, cameraIp);
    const fileName = this.buildRecordingFileName(cameraIp);
    const outputPattern = path.join(outputDir, fileName);
    await fs.mkdir(outputDir, { recursive: true });

    return { outputDir, outputPattern };
  }

  async getSnapshotFromDisk(cameraIp: string): Promise<Buffer> {
    const outputPath = await this.getSnapshotFilePath(cameraIp);
    try {
      const fileBuffer = await fs.readFile(outputPath);
      return fileBuffer;
    } catch (err) {
      throw new NotFoundException(`Snapshot for camera ${cameraIp} not found on disk`, err.message);
    }
  }

  async startSegmentWatcher(
    cameraIp: string,
    outputDir: string,
    recordDuration: string,
  ): Promise<void> {
    const watcher = watch(outputDir, async (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        const regex = new RegExp(`^(\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2})-${cameraIp}\\.mp4$`);
        const match = filename.match(regex);
        if (match) {
          const startTimeStr = match[1];
          const startTime = moment(startTimeStr, 'YYYY-MM-DD_HH-mm-ss');
          if (!startTime.isValid()) {
            this.logger.warn(`Incorrect date format in file name: ${filename}`);
            return;
          }
          const endTime = moment(startTime).add(recordDuration, 'seconds');
          const newFileName = `${startTime.format('YYYY-MM-DD_HH-mm-ss')}-${endTime.format('HH-mm-ss')}-${cameraIp}.mp4`;

          const oldPath = path.join(outputDir, filename);
          const newPath = path.join(outputDir, newFileName);
          try {
            await fs.access(oldPath);
            await fs.rename(oldPath, newPath);
            this.logger.log(`Renamed segment file ${filename} to ${newFileName}`);
          } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
              return null;
            } else {
              this.logger.error(`Error renaming file ${filename}: ${(err as Error).message}`);
            }
          }
        }
      }
    });

    this.segmentWatchers.set(cameraIp, watcher);
  }

  stopSegmentWatcher(cameraIp: string): void {
    const watcher = this.segmentWatchers.get(cameraIp);
    if (watcher) {
      watcher.close();
      this.segmentWatchers.delete(cameraIp);
      this.logger.log(`Stopped segment watcher for camera ${cameraIp}`);
    }
  }

  private buildRecordingFileName(cameraIp: string): string {
    return `%Y-%m-%d_%H-%M-%S-${cameraIp}.mp4`;
  }

  async getSnapshotFilePath(cameraIp: string): Promise<string> {
    const imagesDir = this.configService.get<string>('IMAGES_DIR', './images');
    const outputDir = path.join(imagesDir, cameraIp);
    return path.join(outputDir, 'snapshot.jpg');
  }
}
