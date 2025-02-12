import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CameraSnapshotManager } from './managers/camera-snapshot.manager';

@Module({
  imports: [StorageModule],
  controllers: [MediaController],
  providers: [MediaService, CameraSnapshotManager],
  exports: [MediaService, CameraSnapshotManager],
})
export class MediaModule {}
