import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { CameraScheduleRepository } from './repositories/camera-schedule.repository';
import { DayOfWeekRepository } from './repositories/days-of-week.repository';
import { WorkingTimeDaysOfWeekRepository } from './repositories/working-time-days-of-week.repository';
import { WorkingTimeRepository } from './repositories/working-time.repository';
import { CameraScheduleEntity } from './entities/camera-schedule.entity';

@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectQueue('schedule')
    private readonly schedulerQueue: Queue,
    @InjectRepository(WorkingTimeRepository)
    private readonly workingTimeRepository: WorkingTimeRepository,
    @InjectRepository(WorkingTimeDaysOfWeekRepository)
    private readonly workingTimeDaysOfWeekRepository: WorkingTimeDaysOfWeekRepository,
    @InjectRepository(DayOfWeekRepository)
    private readonly dayOfWeekRepository: DayOfWeekRepository,
    @InjectRepository(CameraScheduleRepository)
    private readonly cameraScheduleRepository: CameraScheduleRepository,
  ) {}

  async onModuleInit() {
    await this.schedulerQueue.add(
      'checkSchedule',
      {},
      {
        repeat: {
          cron: '*/1 * * * *',
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  findAllSchedulesWithRelations(): Promise<CameraScheduleEntity[]> {
    return this.cameraScheduleRepository.findAllWithRelations();
  }
}
