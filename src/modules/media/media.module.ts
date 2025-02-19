import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CameraSnapshotManager } from './managers/camera-snapshot.manager';

@Module({
  imports: [StorageModule, VideoModule],
  controllers: [MediaController],
  providers: [MediaService, CameraSnapshotManager],
  exports: [MediaService, CameraSnapshotManager],
})
export class MediaModule {}
