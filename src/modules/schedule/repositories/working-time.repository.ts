import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { WorkingTimeEntity } from '../entities/working-time.entity';

@Injectable()
export class WorkingTimeRepository extends Repository<WorkingTimeEntity> {
  constructor(private dataSource: DataSource) {
    super(WorkingTimeEntity, dataSource.createEntityManager());
  }
}
