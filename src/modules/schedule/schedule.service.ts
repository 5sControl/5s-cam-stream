import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CameraScheduleRepository } from './repositories/camera-schedule.repository';
import { DayOfWeekRepository } from './repositories/days-of-week.repository';
import { WorkingTimeDaysOfWeekRepository } from './repositories/working-time-days-of-week.repository';
import { WorkingTimeRepository } from './repositories/working-time.repository';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    // @InjectQueue('video') private readonly videoQueue: Queue,

    @InjectRepository(WorkingTimeRepository)
    private readonly workingTimeRepository: WorkingTimeRepository,
    @InjectRepository(WorkingTimeDaysOfWeekRepository)
    private readonly workingTimeDaysOfWeekRepository: WorkingTimeDaysOfWeekRepository,
    @InjectRepository(DayOfWeekRepository)
    private readonly dayOfWeekRepository: DayOfWeekRepository,
    @InjectRepository(CameraScheduleRepository)
    private readonly cameraScheduleRepository: CameraScheduleRepository,
  ) {}
}
