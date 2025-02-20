import { instanceToPlain, plainToInstance } from 'class-transformer';

import { VideoEntity } from '../entities/video.entity';
import { Video } from '../domain/video.domain';
import { CreateVideoDto } from '../dto/create-video.dto';

export class VideoMapper {
  static fromEntityToDomain(entity: VideoEntity): Video {
    return plainToInstance(Video, entity, { excludeExtraneousValues: true });
  }

  static fromDomainToEntity(domain: Video): VideoEntity {
    const plainDomainObject = instanceToPlain(domain);
    return plainToInstance(VideoEntity, plainDomainObject, { enableImplicitConversion: true });
  }

  static fromDtoToEntity(createVideoDto: CreateVideoDto): VideoEntity {
    return plainToInstance(VideoEntity, createVideoDto, { enableImplicitConversion: true });
  }
}
