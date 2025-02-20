import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';

import { CameraScheduleEntity } from '../../schedule/entities/camera-schedule.entity';

@Entity({ schema: 'public', name: 'camera' })
export class CameraEntity {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 250 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRecording: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => CameraScheduleEntity, (cameraSchedule) => cameraSchedule.camera)
  cameraSchedules: CameraScheduleEntity[];
}
