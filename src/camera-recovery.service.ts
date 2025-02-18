import { Injectable, Logger } from '@nestjs/common';

import { CamerasService } from './modules/cameras/cameras.service';

@Injectable()
export class CameraRecoveryService {
  private readonly logger = new Logger(CameraRecoveryService.name);

  constructor(private readonly camerasService: CamerasService) {}

  async recoverActiveCameras(): Promise<void> {
    const activeCameras = await this.camerasService.getActiveCameras();

    for (const camera of activeCameras) {
      try {
        await this.camerasService.activateCameraAndGetSnapshot(camera);

        this.logger.log(`Restored processes for camera: ${camera.ip}`);
      } catch (error) {
        this.logger.error(`Error restoring camera ${camera.ip}: ${error.message}`);
      }
    }
  }
}
