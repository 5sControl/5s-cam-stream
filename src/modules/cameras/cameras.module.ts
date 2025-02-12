import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaModule } from '../media/media.module';
import { StorageModule } from '../storage/storage.module';

import { CamerasService } from './cameras.service';
import { CamerasController } from './cameras.controller';
import { CameraEntity } from './entities/camera.entity';
import { CameraRepository } from './repositories/camera.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CameraEntity]), MediaModule, StorageModule],
  controllers: [CamerasController],
  providers: [CamerasService, CameraRepository],
})
export class CamerasModule {}
