import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { WorkingTimeDaysOfWeekEntity } from './working-time-days-of-week.entity';

@Entity({ schema: 'public', name: 'days_of_week' })
export class DayOfWeekEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  day: string;

  @OneToMany(
    () => WorkingTimeDaysOfWeekEntity,
    (workingTimeDaysOfWeek) => workingTimeDaysOfWeek.dayOfWeek,
  )
  workingDaysOfWeek: WorkingTimeDaysOfWeekEntity[];
}
