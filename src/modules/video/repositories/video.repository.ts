import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { VideoEntity } from '../entities/video.entity';

@Injectable()
export class VideoRepository extends Repository<VideoEntity> {
  constructor(private dataSource: DataSource) {
    super(VideoEntity, dataSource.createEntityManager());
  }

  async findSegments(startTime: number, endTime: number, cameraIp: string): Promise<VideoEntity[]> {
    return this.createQueryBuilder('video')
      .where('video.camera_ip = :cameraIp', { cameraIp })
      .andWhere('video.start_time < :endTime', { endTime })
      .andWhere('video.end_time > :startTime', { startTime })
      .getMany();
  }

  async findByTimeAndCamera(time: number, cameraIp: string): Promise<VideoEntity | null> {
    return this.createQueryBuilder('video')
      .where('video.camera_ip = :cameraIp', { cameraIp })
      .andWhere('video.start_time <= :time', { time: time })
      .andWhere('video.end_time >= :time', { time: time })
      .getOne();
  }
}
