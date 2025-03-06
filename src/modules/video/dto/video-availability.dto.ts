import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class VideoAvailabilityQueryDto {
  @ApiPropertyOptional({
    example: '1740162077000',
    description: 'Timestamp in milliseconds for which we need to check the video fragment.',
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  time: number;

  @ApiPropertyOptional({
    example: '192.168.1.168',
    description: 'IP address of the camera',
  })
  @IsNotEmpty()
  @IsString()
  cameraIp: string;
}
