import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { WorkingTimeDaysOfWeekEntity } from './working-time-days-of-week.entity';

@Entity({ schema: 'public', name: 'working_time' })
export class WorkingTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'time_start', type: 'time' })
  timeStart: string;

  @Column({ name: 'time_end', type: 'time' })
  timeEnd: string;

  @OneToMany(
    () => WorkingTimeDaysOfWeekEntity,
    (workingTimeDaysOfWeek) => workingTimeDaysOfWeek.workingTime,
  )
  workingTimes: WorkingTimeDaysOfWeekEntity[];
}
