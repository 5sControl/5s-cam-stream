import { Injectable, Logger } from '@nestjs/common';
import { timer, Subscription } from 'rxjs';

import { MediaService } from '../media.service';
import { CreateSnapshot } from '../models/interfaces/create-snapshot.interfce';

@Injectable()
export class CameraSnapshotManager {
  private readonly logger = new Logger(CameraSnapshotManager.name);
  private snapshotSubscriptions: Map<string, Subscription> = new Map();

  constructor(private readonly mediaService: MediaService) {}

  start(cameraDto: CreateSnapshot): void {
    if (this.snapshotSubscriptions.has(cameraDto.ip)) {
      this.logger.warn(`Snapshot capture already running for camera ${cameraDto.ip}`);
      return;
    }
    const subscription = timer(0, 1000).subscribe(async () => {
      try {
        const result = await this.mediaService.captureSnapshot(cameraDto);
        this.logger.log(`Snapshot for camera ${cameraDto.ip}: ${result.url}`);
      } catch (error) {
        this.logger.error(`Snapshot error for camera ${cameraDto.ip}: ${error.message}`);
      }
    });
    this.snapshotSubscriptions.set(cameraDto.ip, subscription);
    this.logger.log(`Started snapshot capture for camera ${cameraDto.ip}`);
  }

  stop(cameraIp: string): void {
    const subscription = this.snapshotSubscriptions.get(cameraIp);
    if (subscription) {
      subscription.unsubscribe();
      this.snapshotSubscriptions.delete(cameraIp);
      this.logger.log(`Stopped snapshot capture for camera ${cameraIp}`);
    } else {
      this.logger.warn(`No snapshot capture running for camera ${cameraIp}`);
    }
  }
}
