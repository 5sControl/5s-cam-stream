import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { DayOfWeekEntity } from '../entities/days-of-week.entity';

@Injectable()
export class DayOfWeekRepository extends Repository<DayOfWeekEntity> {
  constructor(private dataSource: DataSource) {
    super(DayOfWeekEntity, dataSource.createEntityManager());
  }
}
