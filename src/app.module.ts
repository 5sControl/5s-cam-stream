import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { DatabaseModule } from './database/database.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { MediaModule } from './modules/media/media.module';
import { StorageModule } from './modules/storage/storage.module';
import { CameraRecoveryService } from './camera-recovery.service';
import { DirectoryService } from './directory.service';
import { VideoModule } from './modules/video/video.module';
import { bullConfig } from './configs/bull.config';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync(bullConfig),
    DatabaseModule,
    CamerasModule,
    MediaModule,
    StorageModule,
    VideoModule,
    BullModule.registerQueue({
      name: 'video',
    }),
    ScheduleModule,
  ],
  providers: [CameraRecoveryService, DirectoryService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly directoryService: DirectoryService,
    private readonly cameraRecoveryService: CameraRecoveryService,
    @InjectQueue('video') private readonly videoQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.directoryService.createDirectories();
    this.videoQueue.on('ready', () => {
      this.logger.log('Bull queue is ready, connection to Redis is established.');
    });

    this.videoQueue.on('error', (error) => {
      this.logger.error(`Bull queue error: ${error.message}`);
    });

    // this.cameraRecoveryService.recoverActiveCameras();
  }
}
