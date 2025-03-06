import { ApiProperty } from '@nestjs/swagger';

export class CameraResponseDto {
  @ApiProperty({
    description: 'Url of the snapshot',
  })
  url: string;
}
