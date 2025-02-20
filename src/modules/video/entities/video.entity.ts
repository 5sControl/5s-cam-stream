import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity({ schema: 'media', name: 'videos' })
export class VideoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'start_time', type: 'bigint' })
  startTime: number;

  @Column({ name: 'end_time', type: 'bigint' })
  endTime: number;

  @Column({ name: 'camera_ip', type: 'text' })
  cameraIp: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
