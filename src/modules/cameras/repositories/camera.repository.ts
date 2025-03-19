import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { CameraEntity } from '../entities/camera.entity';

@Injectable()
export class CameraRepository extends Repository<CameraEntity> {
  constructor(private dataSource: DataSource) {
    super(CameraEntity, dataSource.createEntityManager());
  }
}
