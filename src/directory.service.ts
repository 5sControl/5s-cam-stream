import { promises as fs } from 'fs';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectoryService {
  private readonly logger = new Logger(DirectoryService.name);

  constructor(private readonly configService: ConfigService) {}

  async createDirectories(): Promise<void> {
    const imagesDir = this.configService.get<string>(
      'IMAGES_DIR',
      path.join(__dirname, '..', 'images'),
    );
    const videosDir = this.configService.get<string>(
      'VIDEOS_DIR',
      path.join(__dirname, '..', 'videos'),
    );

    await this.createDirectory(imagesDir);
    await this.createDirectory(videosDir);
  }

  private async createDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
      this.logger.log(`Directory created or already exists: ${dir}`);
    } catch (error) {
      this.logger.error(`Error creating directory ${dir}: ${error.message}`);
    }
  }
}
