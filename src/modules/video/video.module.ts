import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { StorageModule } from '../storage/storage.module';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoEntity } from './entities/video.entity';
import { VideoRepository } from './repositories/video.repository';
import { VideoProcessor } from './processors/video.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    StorageModule,
    BullModule.registerQueue({ name: 'video' }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository, VideoProcessor],
  exports: [VideoService],
})
export class VideoModule {}
