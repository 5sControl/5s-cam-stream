import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class VideoSegmentDto {
  @ApiProperty({
    example: 1740208664774,
    description: 'Start of the video segment (timestamp in ms)',
  })
  @Expose({ name: 'startTime' })
  date_start: number;

  @ApiProperty({
    example: 1740208784774,
    description: 'End of the video segment (timestamp in ms)',
  })
  @Expose({ name: 'endTime' })
  date_end: number;

  @ApiProperty({
    example: 'videos/192.168.1.166/2025-02-22_07-17-07-19-192.168.1.166.mp4',
    description: 'Path to the file on the disk (relative or absolute)',
  })
  @Expose({ name: 'filePath' })
  file_name: string;

  @ApiProperty({
    example: 81226,
    description: 'Offset (in ms) from the start of the segment to play the desired moment',
  })
  @Expose({ name: 'offset' })
  video_start_from: number;

  @ApiProperty({
    example: '192.168.1.166',
    description: 'IP address of the camera',
  })
  @Expose({ name: 'cameraIp' })
  camera_ip: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  id: number;
}
