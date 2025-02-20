import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateManifestDto {
  @ApiProperty({ description: 'Start time in milliseconds.' })
  @IsNumber()
  @IsNotEmpty()
  timeStart: number;

  @ApiProperty({ description: 'End time in milliseconds.' })
  @IsNumber()
  @IsNotEmpty()
  timeEnd: number;

  @ApiProperty({ description: 'Camera IP address.' })
  @IsString()
  @IsNotEmpty()
  cameraIp: string;

  @ApiProperty({ description: 'Unique timespan identifier.' })
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  timespanId: string;
}
