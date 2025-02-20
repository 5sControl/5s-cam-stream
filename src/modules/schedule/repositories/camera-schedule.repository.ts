import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { CameraScheduleEntity } from '../entities/camera-schedule.entity';

@Injectable()
export class CameraScheduleRepository extends Repository<CameraScheduleEntity> {
  constructor(private dataSource: DataSource) {
    super(CameraScheduleEntity, dataSource.createEntityManager());
  }
}
