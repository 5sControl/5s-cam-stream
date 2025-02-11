import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MediaService } from '../media/media.service';
import { CameraSnapshotManager } from '../media/managers/camera-snapshot.manager';

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
  ) {}

  async create(createCameraDto: CreateCameraDto): Promise<CameraResponseDto> {
    const cameraEntity = CameraMapper.fromDtoToEntity(createCameraDto);
    const camera = this.cameraRepository.create(cameraEntity);

    try {
      const savedCamera = await this.cameraRepository.save(camera);
      this.logger.log(`Created camera with ID: ${savedCamera.id}`);
      const snapshotUrl = await this.mediaService.captureSnapshot(createCameraDto);
      this.cameraSnapshotManager.start(createCameraDto);
      return snapshotUrl;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        this.logger.warn(
          `Camera with IP ${createCameraDto.ip} already exists. Activating it instead.`,
        );

        await this.activateExistingCamera(createCameraDto.ip);
        this.cameraSnapshotManager.start(createCameraDto);
        const snapshotUrl = await this.mediaService.captureSnapshot(createCameraDto);
        return snapshotUrl;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async deactivate(ip: string): Promise<Camera> {
    const camera = await this.cameraRepository.findOneBy({ ip });
    if (!camera) {
      throw new NotFoundException(`Camera with ip ${ip} not found`);
    }
    camera.isActive = false;
    const updatedCamera = await this.cameraRepository.save(camera);
    this.logger.log(`Camera with id ${ip} set to inactive.`);
    this.cameraSnapshotManager.stop(ip);
    return CameraMapper.fromEntityToDomain(updatedCamera);
  }

  private isUniqueConstraintViolation(error): boolean {
    return (
      error.code === '23505' ||
      (typeof error.message === 'string' && error.message.includes('UNIQUE constraint failed'))
    );
  }

  private async activateExistingCamera(ip: string): Promise<void> {
    const existingCamera = await this.cameraRepository.findOneBy({ ip });
    if (existingCamera) {
      existingCamera.isActive = true;
      const updatedCamera = await this.cameraRepository.save(existingCamera);
      this.logger.log(`Reactivated camera with ID: ${updatedCamera.id}`);
    } else {
      throw new NotFoundException(`Camera with IP ${ip} not found.`);
    }
  }
}
