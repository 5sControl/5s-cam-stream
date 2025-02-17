import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class CreateCameraDto {
  @IsIP()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
