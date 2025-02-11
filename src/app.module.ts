import { promises as fs } from 'fs';
import * as path from 'path';

import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, CamerasModule, MediaModule],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
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
