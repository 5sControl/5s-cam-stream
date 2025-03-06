import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { CameraEntity } from '../../cameras/entities/camera.entity';

import { WorkingTimeDaysOfWeekEntity } from './working-time-days-of-week.entity';

@Entity({ schema: 'public', name: 'camera_schedule' })
export class CameraScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CameraEntity, (camera) => camera.cameraSchedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camera_id' })
  camera: CameraEntity;

  @ManyToOne(
    () => WorkingTimeDaysOfWeekEntity,
    (workingTimeDay) => workingTimeDay.cameraSchedules,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'working_time_day_id' })
  workingTimeDay: WorkingTimeDaysOfWeekEntity;
}
