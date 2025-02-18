import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class Camera {
  @ApiProperty({
    description: 'IP address of the camera',
    example: '192.168.1.10',
  })
  @Expose({ name: 'id' })
  ip: string;

  @ApiProperty({
    description: 'Username used to connect to the camera',
    example: 'admin',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Name of the camera',
    example: 'admin',
  })
  @Expose()
  name: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Indicates whether the camera is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Timestamp when the camera record was created',
    example: '2023-05-01T12:00:00.000Z',
    readOnly: true,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the camera record was last updated',
    example: '2023-05-02T12:00:00.000Z',
    readOnly: true,
  })
  @Expose()
  updatedAt: Date;
}
