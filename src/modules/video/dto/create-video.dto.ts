import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Path to the video file',
    example: '/videos/sample.mp4',
  })
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @ApiProperty({
    description: 'Start time of the video (timestamp in seconds)',
    example: 1620000000,
  })
  @IsNotEmpty()
  @IsInt()
  startTime: number;

  @ApiProperty({
    description: 'End time of the video (timestamp in seconds)',
    example: 1620000300,
  })
  @IsNotEmpty()
  @IsInt()
  endTime: number;

  @ApiProperty({
    description: 'IP address of the camera that recorded the video',
    example: '192.168.1.10',
  })
  @IsNotEmpty()
  @IsString()
  cameraIp: string;
}
