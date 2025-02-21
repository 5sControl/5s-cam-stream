import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { CamerasService } from 'src/modules/cameras/cameras.service';

import { ScheduleService } from '../schedule.service';

@Processor('schedule')
export class SchedulerProcessor {
  private readonly logger = new Logger(SchedulerProcessor.name);

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly cameraService: CamerasService,
  ) {}

  @Process('checkSchedule')
  async handleCheckSchedule() {
    this.logger.debug('Bull job "checkSchedule" started.');

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDayString = this.mapDayNumberToString(currentDayIndex);

    const cameraSchedules = await this.scheduleService.findAllSchedulesWithRelations();

    for (const schedule of cameraSchedules) {
      const { camera, workingTimeDay } = schedule;
      if (!camera.isActive) {
        this.logger.debug(`Camera ${camera.id} is not active`);
        continue;
      }

      // check day
      const dayFromDb = workingTimeDay.dayOfWeek.day.toLowerCase();

      if (dayFromDb !== currentDayString) {
        this.logger.debug(
          `${camera.id} Day ${dayFromDb} does not match current day ${currentDayString}`,
        );
        continue;
      }

      // check time
      const { timeStart, timeEnd } = workingTimeDay.workingTime;
      const start = timeStart.slice(0, 5);
      const end = timeEnd.slice(0, 5);
      const dto = {
        ip: camera.id,
        username: camera.username,
        password: camera.password,
        name: camera.name,
      };

      if (this.isTimeBetween(currentTime, start, end)) {
        this.logger.debug(
          `${camera.id} Current time ${currentTime} is between ${start} and ${end}`,
        );

        if (!camera.isRecording) {
          this.logger.debug(`${camera.id} Camera ${camera.id} is not recording, run`);
          await this.cameraService.activateCameraAndGetSnapshot(dto);
        }
      } else {
        this.logger.debug(
          `${camera.id} Current time ${currentTime} is not between ${start} and ${end}`,
        );

        if (camera.isRecording) {
          this.logger.debug(`${camera.id} Camera ${camera.id} is recording, stop`);
          await this.cameraService.stopRecording(camera.id);
        }
      }
    }

    this.logger.debug('Bull job "checkSchedule" finished.');
  }

  private mapDayNumberToString(dayIndex: number): string {
    switch (dayIndex) {
      case 0:
        return 'sunday';
      case 1:
        return 'monday';
      case 2:
        return 'tuesday';
      case 3:
        return 'wednesday';
      case 4:
        return 'thursday';
      case 5:
        return 'friday';
      case 6:
        return 'saturday';
      default:
        return '';
    }
  }

  private isTimeBetween(current: string, start: string, end: string): boolean {
    const toMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const curMin = toMinutes(current);
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    return curMin >= startMin && curMin < endMin;
  }
}
