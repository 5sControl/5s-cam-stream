import { instanceToPlain, plainToInstance } from 'class-transformer';

import { CameraScheduleEntity } from '../entities/camera-schedule.entity';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { CameraSchedule } from '../domain/camera-schedule.domain';

export class CameraScheduleMapper {
  static fromEntityToDomain(entity: CameraScheduleEntity): CameraSchedule {
    return plainToInstance(CameraSchedule, entity, { excludeExtraneousValues: true });
  }

  static fromDomainToEntity(domain: CameraSchedule): CameraScheduleEntity {
    const plainDomainObject = instanceToPlain(domain);
    return plainToInstance(CameraScheduleEntity, plainDomainObject, {
      enableImplicitConversion: true,
    });
  }

  static fromDtoToEntity(dto: CreateScheduleDto): CameraScheduleEntity {
    return plainToInstance(CameraScheduleEntity, { ...dto }, { enableImplicitConversion: true });
  }
}
