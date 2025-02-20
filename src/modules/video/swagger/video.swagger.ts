import { HttpStatus } from '@nestjs/common';
import { ApiBodyOptions, ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

import { CreateManifestDto } from '../dto/create-manifest.dto';

export const getManifestOperation: ApiOperationOptions = {
  summary: 'Create video manifest',
  description:
    'Creates an m3u8 manifest file based on provided timeStart, timeEnd, cameraIp, and timespanId. ' +
    'Returns a URL link to the generated manifest file.',
};

export const getManifestResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Manifest URL successfully generated.',
  schema: {
    example: {
      manifestUrl:
        'https://yourdomain.com/videos/192.168.1.168/abc123_1672531200000_1672534800000.m3u8',
    },
  },
};

export const getInvalidParamResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid request parameters.',
};

export const getManifestFaledResponse: ApiResponseOptions = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal Server Error while creating the manifest.',
};

export const manifestBody: ApiBodyOptions = {
  description: 'Parameters to create the video manifest.',
  type: CreateManifestDto,
  examples: {
    example1: {
      summary: 'Valid payload',
      value: {
        timeStart: 1672531200000,
        timeEnd: 1672534800000,
        cameraIp: '192.168.1.168',
        timespanId: 'abc123',
      },
    },
  },
};
