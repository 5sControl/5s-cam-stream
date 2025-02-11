import { instanceToPlain, plainToInstance } from 'class-transformer';

import { CameraEntity } from '../entities/camera.entity';
import { Camera } from '../domain/camera.domain';
import { CreateCameraDto } from '../dto/create-camera.dto';

export class CameraMapper {
  static fromEntityToDomain(entity: CameraEntity): Camera {
    return plainToInstance(Camera, entity, { excludeExtraneousValues: true });
  }

  static fromDomainToEntity(domain: Camera): CameraEntity {
    const plainDomainObject = instanceToPlain(domain);
    return plainToInstance(CameraEntity, plainDomainObject, { enableImplicitConversion: true });
  }

  static fromDtoToEntity(createCameraDto: CreateCameraDto): CameraEntity {
    return plainToInstance(CameraEntity, createCameraDto, { enableImplicitConversion: true });
  }
}
