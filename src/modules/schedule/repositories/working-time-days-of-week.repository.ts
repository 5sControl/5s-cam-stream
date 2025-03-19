import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { WorkingTimeDaysOfWeekEntity } from '../entities/working-time-days-of-week.entity';

@Injectable()
export class WorkingTimeDaysOfWeekRepository extends Repository<WorkingTimeDaysOfWeekEntity> {
  constructor(private dataSource: DataSource) {
    super(WorkingTimeDaysOfWeekEntity, dataSource.createEntityManager());
  }
}
