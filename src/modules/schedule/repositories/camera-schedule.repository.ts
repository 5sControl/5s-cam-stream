import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

import { CameraScheduleEntity } from '../entities/camera-schedule.entity';

@Injectable()
export class CameraScheduleRepository extends Repository<CameraScheduleEntity> {
  private readonly logger = new Logger(CameraScheduleRepository.name);
  constructor(private dataSource: DataSource) {
    super(CameraScheduleEntity, dataSource.createEntityManager());
  }

  // findAllWithRelations(): Promise<CameraScheduleEntity[]> {
  //   return this.find({
  //     relations: {
  //       camera: true,
  //       workingTimeDay: {
  //         dayOfWeek: true,
  //         workingTime: true,
  //       },
  //     },
  //   });
  // }

  async findAllWithRelations(): Promise<CameraScheduleEntity[]> {
    try {
      return await this.find({
        relations: {
          camera: true,
          workingTimeDay: {
            dayOfWeek: true,
            workingTime: true,
          },
        },
      });
    } catch (error) {
      this.logger.error('Error executing findAllWithRelations', error);
      throw error;
    }
  }
}
