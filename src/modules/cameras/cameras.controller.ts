import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CamerasService } from './cameras.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { CameraResponseDto } from './dto/camera-response.dto';
import { Camera } from './domain/camera.domain';
import {
  createCameraBadResponse,
  createCameraBody,
  createCameraOperation,
  createCameraResponse,
  deactivateCameraOperation,
  deactivateCameraParam,
  deactivateCameraResponse,
} from './swagger/cameras.swagger';

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
    return this.camerasService.create(createCameraDto);
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
}
