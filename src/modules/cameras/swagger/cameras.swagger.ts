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
import { SnapshotCameraDto } from '../dto/snapshot-camera.dto';

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

export const getSnapshotOperation: ApiOperationOptions = {
  summary: 'Retrieve camera snapshot',
  description:
    'Returns a snapshot of the camera as a JPEG file by IP if the camera is added and active. ' +
    'If the camera is added but inactive, a 400 error is returned with an appropriate message. ' +
    'If the camera is not added, a 404 error is returned.',
};

export const getSnapshotResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Snapshot successfully retrieved as a JPEG image file.',
  content: {
    'image/jpeg': {
      schema: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

export const getSnapshotInactiveResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Camera is added but inactive.',
};

export const getSnapshotNotFoundResponse: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'Camera is not added.',
};

export const snapshotCameraBody: ApiBodyOptions = {
  description: 'Camera IP to retrieve the snapshot.',
  type: SnapshotCameraDto,
  examples: {
    example1: {
      summary: 'Camera IP example',
      value: {
        ip: '192.168.1.168',
      },
    },
  },
};
