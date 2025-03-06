import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CamerasService } from './cameras.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { CameraResponseDto } from './dto/camera-response.dto';
import { Camera } from './domain/camera.domain';
import {
  cameraStatus,
  cameraStatusBadResponse,
  cameraStatusBody,
  cameraStatusResponse,
  checkRtspUrlBadResponse,
  checkRtspUrlBody,
  checkRtspUrlOperation,
  checkRtspUrlResponse,
  createCameraBadResponse,
  createCameraBody,
  createCameraOperation,
  createCameraResponse,
  deactivateCameraOperation,
  deactivateCameraParam,
  deactivateCameraResponse,
  getSnapshotInactiveResponse,
  getSnapshotNotFoundResponse,
  getSnapshotOperation,
  getSnapshotResponse,
  snapshotCameraBody,
} from './swagger/cameras.swagger';
import { SnapshotCameraDto } from './dto/snapshot-camera.dto';
import { CheckStreamUrlDto } from './dto/check-stream-url.dto';
import { StatusCameraDto } from './dto/status-camera.dto';

@Controller('cameras')
export class CamerasController {
  private readonly logger = new Logger(CamerasController.name);

  constructor(private readonly camerasService: CamerasService) {}

  // /add_camera
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(createCameraOperation)
  @ApiResponse(createCameraResponse)
  @ApiResponse(createCameraBadResponse)
  @ApiBody(createCameraBody)
  async create(@Body() createCameraDto: CreateCameraDto): Promise<CameraResponseDto> {
    this.logger.log(`Creating camera with IP: ${JSON.stringify(createCameraDto)}`);
    return this.camerasService.addCamera(createCameraDto);
  }

  @Patch(':ip/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(deactivateCameraOperation)
  @ApiResponse(deactivateCameraResponse)
  @ApiParam(deactivateCameraParam)
  async deactivate(@Param('ip') ip: string): Promise<Camera> {
    this.logger.log(`Deactivating camera with IP: ${ip}`);
    return this.camerasService.deactivate(ip);
  }
  // /get_actual_screenshot
  @Post('snapshot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(getSnapshotOperation)
  @ApiResponse(getSnapshotResponse)
  @ApiResponse(getSnapshotInactiveResponse)
  @ApiResponse(getSnapshotNotFoundResponse)
  @ApiBody(snapshotCameraBody)
  async getSnapshot(@Body() snapshotCameraDto: SnapshotCameraDto): Promise<StreamableFile> {
    const { ip } = snapshotCameraDto;
    this.logger.log(`Requesting snapshot for camera with IP: ${ip}`);
    const fileBuffer = await this.camerasService.getSnapshot(ip);
    return new StreamableFile(fileBuffer, { type: 'image/jpeg' });
  }

  // /get_stream_url
  @Post('stream-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(checkRtspUrlOperation)
  @ApiBody(checkRtspUrlBody)
  @ApiResponse(checkRtspUrlResponse)
  @ApiResponse(checkRtspUrlBadResponse)
  async checkRtspUrl(@Body() dto: CheckStreamUrlDto) {
    this.logger.log(`Check RTSP URL for IP=${dto.ip}`);
    const { ip, username, password } = dto;
    const rtspUrl = await this.camerasService.getRtspUrlOrFail(ip, username, password);
    return { url: rtspUrl };
  }

  @Post('verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(cameraStatus)
  @ApiBody(cameraStatusBody)
  @ApiResponse(cameraStatusResponse)
  @ApiResponse(cameraStatusBadResponse)
  async getStatusCamera(@Body() snapshotCameraDto: StatusCameraDto): Promise<StreamableFile> {
    this.logger.log(`Checking snapshot for camera with IP: ${snapshotCameraDto.ip}`);

    const fileBuffer = await this.camerasService.getStatusCamera(snapshotCameraDto);

    return new StreamableFile(fileBuffer, { type: 'image/jpeg' });
  }
}
