import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { MediaService } from '../media/media.service';
import { CameraSnapshotManager } from '../media/managers/camera-snapshot.manager';
import { SnapshotResult } from '../media/models/interfaces/snapshot-result.interface';
import { StorageService } from '../storage/storage.service';

import { CameraRepository } from './repositories/camera.repository';
import { CreateCameraDto } from './dto/create-camera.dto';
import { CameraMapper } from './mappers/camera.mapper';
import { CameraResponseDto } from './dto/camera-response.dto';
import { Camera } from './domain/camera.domain';

@Injectable()
export class CamerasService {
  private readonly logger = new Logger(CamerasService.name);

  constructor(
    @InjectRepository(CameraRepository)
    private readonly cameraRepository: CameraRepository,
    private readonly mediaService: MediaService,
    private readonly cameraSnapshotManager: CameraSnapshotManager,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async create(createCameraDto: CreateCameraDto): Promise<CameraResponseDto> {
    const { ip } = createCameraDto;
    const camera = await this.getCamera(ip);

    if (!camera) {
      const cameraEntity = CameraMapper.fromDtoToEntity(createCameraDto);
      const camera = this.cameraRepository.create(cameraEntity);
      const savedCamera = await this.cameraRepository.save(camera);
      this.logger.log(`Created camera with ID: ${savedCamera.id}`);
      const snapshotUrl = await this.activateCameraAndGetSnapshot(createCameraDto);
      return snapshotUrl;
    } else {
      await this.activateExistingCamera(createCameraDto.ip);
      const snapshotUrl = await this.activateCameraAndGetSnapshot(createCameraDto);
      return snapshotUrl;
    }
  }

  async deactivate(ip: string): Promise<Camera> {
    const camera = await this.cameraRepository.findOneBy({ id: ip });

    if (!camera || !camera.isActive) {
      throw new NotFoundException(`Camera with ip ${ip} not found or inactive`);
    }
    camera.isActive = false;
    const updatedCamera = await this.cameraRepository.save(camera);
    this.cameraSnapshotManager.stop(ip);
    await this.mediaService.stopRecording(ip);
    return CameraMapper.fromEntityToDomain(updatedCamera);
  }

  async getSnapshot(ip: string): Promise<Buffer> {
    const camera = await this.cameraRepository.findOneBy({ id: ip });
    if (!camera) {
      throw new NotFoundException(`Camera with IP ${ip} is not added`);
    }
    if (!camera.isActive) {
      throw new BadRequestException(`Camera with IP ${ip} is inactive`);
    }

    return this.storageService.getSnapshotFromDisk(ip);
  }

  private async activateExistingCamera(ip: string): Promise<void> {
    const existingCamera = await this.cameraRepository.findOneBy({ id: ip });
    if (existingCamera) {
      existingCamera.isActive = true;
      const updatedCamera = await this.cameraRepository.save(existingCamera);
      this.logger.log(`Reactivated camera with ID: ${updatedCamera.id}`);
    } else {
      throw new NotFoundException(`Camera with IP ${ip} not found.`);
    }
  }

  async activateCameraAndGetSnapshot(createCameraDto: CreateCameraDto): Promise<SnapshotResult> {
    const { username, password, ip } = createCameraDto;
    const recordDuration = this.configService.getOrThrow<string>('RECORD_DURATION');
    const rtspUrl = await this.mediaService.getWorkingRtspUrl(username, password, ip);
    const { outputPath, imagesUrl } = await this.storageService.prepareSnapshotFolder(ip);
    const snapshotUrl = await this.mediaService.captureSnapshot(ip, rtspUrl, imagesUrl, outputPath);
    this.cameraSnapshotManager.start(ip, rtspUrl, imagesUrl, outputPath);
    await this.mediaService.initiateRecording(ip, rtspUrl, recordDuration);
    return snapshotUrl;
  }

  private async getCamera(ip: string) {
    const camera = await this.cameraRepository.findOneBy({ id: ip });

    return camera ?? null;
  }

  async getActiveCameras(): Promise<Camera[]> {
    const rawCameras = await this.cameraRepository.find({ where: { isActive: true } });
    return rawCameras.map((camera) => CameraMapper.fromEntityToDomain(camera));
  }
}
