import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CamerasModule } from '../cameras/cameras.module';

import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { CameraScheduleEntity } from './entities/camera-schedule.entity';
import { DayOfWeekEntity } from './entities/days-of-week.entity';
import { WorkingTimeDaysOfWeekEntity } from './entities/working-time-days-of-week.entity';
import { WorkingTimeEntity } from './entities/working-time.entity';
import { CameraScheduleRepository } from './repositories/camera-schedule.repository';
import { DayOfWeekRepository } from './repositories/days-of-week.repository';
import { WorkingTimeDaysOfWeekRepository } from './repositories/working-time-days-of-week.repository';
import { WorkingTimeRepository } from './repositories/working-time.repository';
import { SchedulerProcessor } from './processors/scheduler.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([CameraScheduleEntity]),
    TypeOrmModule.forFeature([DayOfWeekEntity]),
    TypeOrmModule.forFeature([WorkingTimeDaysOfWeekEntity]),
    TypeOrmModule.forFeature([WorkingTimeEntity]),
    BullModule.registerQueue({ name: 'schedule' }),
    CamerasModule,
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    CameraScheduleRepository,
    DayOfWeekRepository,
    WorkingTimeDaysOfWeekRepository,
    WorkingTimeRepository,
    SchedulerProcessor,
  ],
})
export class ScheduleModule {}
