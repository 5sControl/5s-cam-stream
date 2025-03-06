import { IsIP, IsNotEmpty } from 'class-validator';

export class SnapshotCameraDto {
  @IsIP()
  @IsNotEmpty()
  ip: string;
}
