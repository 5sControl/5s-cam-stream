import * as path from 'path';
import { promises as fs, Stats } from 'fs';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateManifestDto } from '../video/dto/create-manifest.dto';

import { TimespanPaths } from './models/interfaces/timespan-paths.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

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

  async renameSegmentFile(
    outputDir: string,
    filename: string,
    newFileName: string,
  ): Promise<string | null> {
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

  private buildRecordingFileName(cameraIp: string): string {
    return `%Y-%m-%d_%H-%M-%S-${cameraIp}.mp4`;
  }

  async getSnapshotFilePath(cameraIp: string): Promise<string> {
    const imagesDir = this.configService.get<string>('IMAGES_DIR', './images');
    const outputDir = path.join(imagesDir, cameraIp);
    return path.join(outputDir, 'snapshot.jpg');
  }

  async generateChunkFilePath(
    timespanDir: string,
    timespanId: string,
    timeStart: number,
    timeEnd: number,
    cameraIp: string,
    chunkIndex: number,
  ) {
    await fs.mkdir(timespanDir, { recursive: true });
    const chunkName = `${timespanId}_${timeStart}_${timeEnd}_${cameraIp}_${chunkIndex}.ts`;
    return path.join(timespanDir, chunkName);
  }

  getManifestPath(body: CreateManifestDto): TimespanPaths {
    const { timeStart, timeEnd, cameraIp, timespanId } = body;
    const videosDir = this.configService.get<string>(
      'VIDEOS_DIR',
      path.join(__dirname, '..', 'videos'),
    );

    const timespanFolder = `${timespanId}_${timeStart}_${timeEnd}`;
    const timespanDir = path.join(videosDir, cameraIp, timespanFolder);
    const m3u8Name = `${timespanId}_${timeStart}_${timeEnd}_${cameraIp}.m3u8`;
    const manifestPath = path.join(timespanDir, m3u8Name);

    return { timespanDir, manifestPath, timespanFolder };
  }

  generatePublicChunkPath(outTsPath: string, cameraIp: string): string {
    const chunkName = path.basename(outTsPath);

    const publicChunkPath = path.join('videos', cameraIp, chunkName).replace(/\\/g, '/');
    return publicChunkPath;
  }

  async writeManifest(timespanDir: string, manifestPath: string, m3u8: string): Promise<void> {
    await fs.mkdir(timespanDir, { recursive: true });
    await fs.writeFile(manifestPath, m3u8, 'utf8');
  }

  async readDirSafe(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  async statSafe(path: string): Promise<Stats | null> {
    try {
      return await fs.stat(path);
    } catch (err) {
      this.logger.warn(`Can't stat ${path}: ${(err as Error).message}`);
      return null;
    }
  }

  async removeFolder(fullPath: string): Promise<void> {
    await fs.rm(fullPath, { recursive: true, force: true });
    this.logger.log(`Removed folder: ${fullPath}`);
  }

  async removeFile(fullPath: string): Promise<void> {
    await fs.unlink(fullPath);
    this.logger.log(`Removed old file: ${fullPath}`);
  }
}
