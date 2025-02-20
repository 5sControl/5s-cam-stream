import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { WorkingTimeEntity } from './working-time.entity';
import { DayOfWeekEntity } from './days-of-week.entity';
import { CameraScheduleEntity } from './camera-schedule.entity';

@Entity({ schema: 'public', name: 'working_time_days_of_week' })
export class WorkingTimeDaysOfWeekEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkingTimeEntity, (workingTime) => workingTime.workingTimes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workingtime_id' })
  workingTime: WorkingTimeEntity;

  @ManyToOne(() => DayOfWeekEntity, (dayOfWeek) => dayOfWeek.workingDaysOfWeek, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dayofweek_id' })
  dayOfWeek: DayOfWeekEntity;

  @OneToMany(() => CameraScheduleEntity, (cameraSchedule) => cameraSchedule.workingTimeDay)
  cameraSchedules: CameraScheduleEntity[];
}
