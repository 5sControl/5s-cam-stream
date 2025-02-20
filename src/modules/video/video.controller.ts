import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { VideoService } from './video.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import {
  getInvalidParamResponse,
  getManifestFaledResponse,
  getManifestOperation,
  getManifestResponse,
  manifestBody,
} from './swagger/video.swagger';

@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);
  constructor(private readonly videoService: VideoService) {}

  @Post('create_manifest')
  @ApiOperation(getManifestOperation)
  @ApiResponse(getManifestResponse)
  @ApiResponse(getInvalidParamResponse)
  @ApiResponse(getManifestFaledResponse)
  @ApiBody(manifestBody)
  async createManifest(@Body() body: CreateManifestDto): Promise<string> {
    return this.videoService.createManifest(body);
  }
}
