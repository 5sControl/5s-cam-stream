import { OmitType } from '@nestjs/swagger';

import { CreateCameraDto } from './create-camera.dto';

export class StatusCameraDto extends OmitType(CreateCameraDto, ['name'] as const) {}
