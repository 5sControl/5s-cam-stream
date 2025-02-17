import { HttpStatus } from '@nestjs/common';
import {
  ApiResponseOptions,
  ApiParamOptions,
  ApiBodyOptions,
  ApiOperationOptions,
} from '@nestjs/swagger';

import { Camera } from '../domain/camera.domain';
import { CameraResponseDto } from '../dto/camera-response.dto';
import { CreateCameraDto } from '../dto/create-camera.dto';

export const createCameraOperation: ApiOperationOptions = {
  summary: 'Add a new camera',
  description:
    'Connect a new camera by providing its IP, username, and password. ' +
    'The camera will be registered and stored for further video recording and screenshot capture.',
};

export const createCameraResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description: 'The camera was successfully connected and created.',
  type: CameraResponseDto,
};

export const createCameraBadResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid input data. Check the request body and try again.',
};

export const createCameraBody: ApiBodyOptions = {
  description: 'Details of the camera to be connected.',
  type: CreateCameraDto,
  examples: {
    example1: {
      summary: 'Complete Data',
      value: {
        ip: '192.168.1.168',
        username: 'admin',
        password: 'just4Taqtile',
        name: 'camera',
      },
    },
  },
};

export const deactivateCameraOperation: ApiOperationOptions = {
  summary: 'Deactivate a camera',
  description: 'Deactivates a camera by updating its isActive field to false.',
};

export const deactivateCameraResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'The camera was successfully deactivated.',
  type: Camera,
};

export const deactivateCameraParam: ApiParamOptions = {
  name: 'ip',
  type: String,
  description: 'IP of the camera to be deactivated',
  example: '192.168.1.168',
};
