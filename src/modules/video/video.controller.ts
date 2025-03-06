import { Controller, Post, Body, Logger, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { VideoService } from './video.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import {
  getInvalidParamResponse,
  getManifestFaledResponse,
  getManifestOperation,
  getManifestResponse,
  manifestBody,
  videoAvailabilityBadResponse,
  videoAvailabilityNotFound,
  videoAvailabilityOperation,
  videoAvailabilityResponse,
} from './swagger/video.swagger';
import { VideoAvailabilityQueryDto } from './dto/video-availability.dto';
import { VideoSegmentDto } from './dto/video-segment.dto';

@Controller('videos')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);
  constructor(private readonly videoService: VideoService) {}

  @Post('create-manifest')
  @ApiOperation(getManifestOperation)
  @ApiResponse(getManifestResponse)
  @ApiResponse(getInvalidParamResponse)
  @ApiResponse(getManifestFaledResponse)
  @ApiBody(manifestBody)
  async createManifest(@Body() body: CreateManifestDto): Promise<string> {
    return this.videoService.createManifest(body);
  }

  // /is_video_available
  @Get('availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(videoAvailabilityOperation)
  @ApiResponse(videoAvailabilityResponse)
  @ApiResponse(videoAvailabilityNotFound)
  @ApiResponse(videoAvailabilityBadResponse)
  async checkAvailability(@Query() query: VideoAvailabilityQueryDto): Promise<VideoSegmentDto> {
    const { time, cameraIp } = query;
    this.logger.log(`GET /videos/availability?time=${time}&cameraIp=${cameraIp}`);

    const result = await this.videoService.checkVideoAvailability(time, cameraIp);
    return result;
  }
}
