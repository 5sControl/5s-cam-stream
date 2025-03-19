import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Camera } from '../../cameras/domain/camera.domain';

// import { WorkingTimeDaysOfWeek } from './working-time-days-of-week.domain';

export class CameraSchedule {
  @ApiProperty({
    description: 'Уникальный идентификатор расписания камеры',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Камера, связанная с данным расписанием',
    type: Camera,
  })
  @Expose()
  camera: Camera;

  //   @ApiProperty({
  //     description: 'Данные о дне недели и рабочем времени для расписания',
  //     type: WorkingTimeDaysOfWeek,
  //   })
  //   @Expose()
  //   workingTimeDay: WorkingTimeDaysOfWeek;
}
