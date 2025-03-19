import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CamerasService } from '../cameras/cameras.service';

@Injectable()
export class CameraEventsService {
  constructor(private readonly camerasService: CamerasService) {}

  @OnEvent('camera.stopped')
  async handleCameraStoppedEvent(cameraIp: string) {
    await this.camerasService.updateRecordingStatus(cameraIp, false);
  }
}
