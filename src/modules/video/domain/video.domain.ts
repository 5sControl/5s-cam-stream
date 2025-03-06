import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Video {
  @ApiProperty({
    description: 'Unique identifier of the video',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Path to the video file',
    example: '/videos/sample.mp4',
  })
  @Expose()
  filePath: string;

  @ApiProperty({
    description: 'Start time of the video (timestamp in seconds)',
    example: 1620000000,
  })
  @Expose()
  startTime: number;

  @ApiProperty({
    description: 'End time of the video (timestamp in seconds)',
    example: 1620000300,
  })
  @Expose()
  endTime: number;

  @ApiProperty({
    description: 'IP address of the camera that recorded the video',
    example: '192.168.1.10',
  })
  @Expose()
  cameraIp: string;

  @ApiProperty({
    description: 'Timestamp when the video record was created',
    example: '2023-05-01T12:00:00.000Z',
    readOnly: true,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the video record was last updated',
    example: '2023-05-02T12:00:00.000Z',
    readOnly: true,
  })
  @Expose()
  updatedAt: Date;
}
