import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { MediaModule } from './modules/media/media.module';
import { StorageModule } from './modules/storage/storage.module';
import { CameraRecoveryService } from './camera-recovery.service';
import { DirectoryService } from './directory.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CamerasModule,
    MediaModule,
    StorageModule,
  ],
  providers: [CameraRecoveryService, DirectoryService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly directoryService: DirectoryService,
    private readonly cameraRecoveryService: CameraRecoveryService,
  ) {}

  async onModuleInit() {
    await this.directoryService.createDirectories();
    // this.cameraRecoveryService.recoverActiveCameras();
  }
}
