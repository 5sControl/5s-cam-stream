import { OmitType } from '@nestjs/swagger';

import { CreateCameraDto } from './create-camera.dto';

export class CheckStreamUrlDto extends OmitType(CreateCameraDto, ['name'] as const) {}
