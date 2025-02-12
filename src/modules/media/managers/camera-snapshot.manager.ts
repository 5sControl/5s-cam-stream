/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { timer, Subscription } from 'rxjs';

import { MediaService } from '../media.service';

@Injectable()
export class CameraSnapshotManager {
  private readonly logger = new Logger(CameraSnapshotManager.name);
  private snapshotSubscriptions: Map<string, Subscription> = new Map();

  constructor(private readonly mediaService: MediaService) {}

  async start(
    cameraIp: string,
    rtspUrl: string,
    imagesUrl: string,
    outputPath: string,
  ): Promise<void> {
    if (this.snapshotSubscriptions.has(cameraIp)) {
      this.logger.warn(`Snapshot capture already running for camera ${cameraIp}`);
      return;
    }

    const subscription = timer(0, 1000).subscribe(async () => {
      try {
        const result = await this.mediaService.captureSnapshot(
          cameraIp,
          rtspUrl,
          imagesUrl,
          outputPath,
        );
        this.logger.log(`Snapshot for camera ${cameraIp}: ${result.url}`);
      } catch (error) {
        this.logger.warn(`Snapshot error for camera ${cameraIp}`);
      }
    });
    this.snapshotSubscriptions.set(cameraIp, subscription);
    this.logger.log(`Started snapshot capture for camera ${cameraIp}`);
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
