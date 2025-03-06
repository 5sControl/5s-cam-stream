import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCameraDto {
  @ApiProperty({
    example: '192.168.1.168',
    description: 'IP address of the camera',
  })
  @IsIP()
  @IsNotEmpty()
  ip: string;

  @ApiProperty({
    example: 'admin',
    description: 'Username for the camera',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'somePassword',
    description: 'Password for the camera',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Camera 1',
    description: 'Name of the camera',
  })
  @IsString()
  @IsOptional()
  name: string;
}
