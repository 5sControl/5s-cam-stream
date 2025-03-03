/* eslint-disable @typescript-eslint/no-unused-vars */
import { promises as fsPromise } from 'fs';
import path from 'path';

import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { StorageService } from '../storage/storage.service';

import { CreateManifestDto } from './dto/create-manifest.dto';
import { ChunkInfo } from './models/interfaces/chunk-info.interface';
import { VideoRepository } from './repositories/video.repository';
import { VideoMapper } from './mappers/video.mapper';
import { Video } from './domain/video.domain';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoSegmentDto } from './dto/video-segment.dto';

@Injectable()
export class VideoService implements OnModuleInit {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectQueue('video') private readonly videoQueue: Queue,
    @InjectQueue('videoCleanup')
    private readonly cleanupQueue: Queue,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    @InjectRepository(VideoRepository)
    private readonly videoRepository: VideoRepository,
  ) {}

  async onModuleInit() {
    await this.cleanupQueue.add(
      'cleanupOldVideos',
      {},
      {
        repeat: {
          cron: '0 * * * *',
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    await this.cleanupQueue.add(
      'checkDiskSpace',
      {},
      {
        repeat: {
          cron: '05 * * * *',
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  public async saveVideo(createVideoDto: CreateVideoDto): Promise<Video> {
    const videoEntity = VideoMapper.fromDtoToEntity(createVideoDto);

    const savedVideo = await this.videoRepository.save(videoEntity);
    return VideoMapper.fromEntityToDomain(savedVideo);
  }

  public async deleteVideo(id: number): Promise<void> {
    const result = await this.videoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Video with id ${id} not found`);
    }
  }

  async deleteVideoRecord(filePath: string): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { filePath } });
    if (!video) {
      this.logger.warn(`No DB record found for filePath=${filePath}`);
      return;
    }

    await this.videoRepository.delete(video.id);
    this.logger.log(`DB record for file ${filePath} (id=${video.id}) was deleted`);
  }

  public async createManifest(body: CreateManifestDto): Promise<string> {
    const { timeStart, timeEnd, cameraIp, timespanId } = body;
    const { timespanDir, manifestPath } = this.storageService.getManifestPath(body);

    const existingManifestPath = await this.checkAndReturnManifestPath(manifestPath);
    if (existingManifestPath) {
      return existingManifestPath;
    }

    const foundSegments = await this.videoRepository.findSegments(timeStart, timeEnd, cameraIp);
    const segments = foundSegments.map((segment) => VideoMapper.fromEntityToDomain(segment));

    if (!segments.length) {
      throw new NotFoundException('No segments found');
    }

    const chunkInfos: ChunkInfo[] = await this.generateChunkInfos(
      segments,
      timespanDir,
      timespanId,
      timeStart,
      timeEnd,
      cameraIp,
    );

    if (!chunkInfos.length) {
      throw new NotFoundException('No valid chunks to generate.');
    }

    const m3u8 = this.generateM3u8(chunkInfos, cameraIp);

    try {
      await this.storageService.writeManifest(timespanDir, manifestPath, m3u8);
      // for (const chunk of chunkInfos) {
      //   await this.videoQueue.add('convert', chunk);
      // }

      return this.storageService.getRelativePathForManifest(manifestPath);
    } catch (error) {
      console.error('Error writing manifest', error);
    }
  }

  private async checkAndReturnManifestPath(manifestPath: string): Promise<string | null> {
    try {
      await fsPromise.stat(manifestPath);
      return this.storageService.getRelativePathForManifest(manifestPath);
    } catch (error) {
      return null;
    }
  }

  public async generateChunkInfos(
    segments: Video[],
    timespanDir: string,
    timespanId: string,
    startTimeMs: number,
    endTimeMs: number,
    cameraIp: string,
  ): Promise<ChunkInfo[]> {
    const recordDuration = +this.configService.get<string>('RECORD_DURATION', '30');
    let chunkIndex = 0;
    let cumulativeDuration = 0;
    const chunkInfos: ChunkInfo[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let segmentInputOffset = 0;
      let chunkDuration = recordDuration;

      if (i === 0) {
        segmentInputOffset = (startTimeMs - segment.startTime) / 1000;
        if (segmentInputOffset > 0) {
          chunkDuration = recordDuration - segmentInputOffset;
        }
      }

      if (i === segments.length - 1) {
        const endOffset = (endTimeMs - segment.startTime) / 1000;
        const availableDuration = endOffset - segmentInputOffset;
        if (availableDuration < chunkDuration) {
          chunkDuration = availableDuration;
        }
      }

      if (chunkDuration <= 0) continue;

      const chunkStartTime = cumulativeDuration;
      cumulativeDuration += chunkDuration;

      const chunkOutputPath = await this.storageService.generateChunkFilePath(
        timespanDir,
        timespanId,
        startTimeMs,
        endTimeMs,
        cameraIp,
        chunkIndex,
      );

      chunkInfos.push({
        filePath: segment.filePath,
        chunkOutputPath,
        chunkStartTime,
        chunkDuration,
        segmentInputOffset,
      });

      chunkIndex++;
    }

    return chunkInfos;
  }

  private generateM3u8(chunkInfos: ChunkInfo[], cameraIp: string): string {
    const recordDuration = this.configService.get<string>('RECORD_DURATION', '30');
    let m3u8 = '#EXTM3U\n';
    m3u8 += '#EXT-X-VERSION:3\n';
    m3u8 += `#EXT-X-TARGETDURATION:${recordDuration}\n`;
    m3u8 += '#EXT-X-MEDIA-SEQUENCE:0\n';

    for (let i = 0; i < chunkInfos.length; i++) {
      let duration = Number(chunkInfos[i].chunkDuration.toFixed(3));
      if (duration < 0) {
        duration = 0;
      }
      const publicPath = this.storageService.generatePublicChunkPath(
        path.basename(chunkInfos[i].filePath),
      );
      m3u8 += `#EXTINF:${duration},\n`;
      m3u8 += `${publicPath}\n`;
    }
    m3u8 += '#EXT-X-ENDLIST\n';

    return m3u8;
  }

  async checkVideoAvailability(time: number, cameraIp: string): Promise<VideoSegmentDto> {
    const video: Video = await this.findSegment(time, cameraIp);
    await this.storageService.statSafe(video.filePath);
    const rollBackTime = 2_000;
    let videoStartFrom: number = time - video.startTime;
    videoStartFrom = Math.max(0, videoStartFrom - rollBackTime);
    return VideoMapper.toSegmentDto({ ...video, offset: videoStartFrom });
  }

  async findSegment(time: number, cameraIp: string): Promise<Video> {
    const video = await this.videoRepository.findByTimeAndCamera(time, cameraIp);
    if (!video) {
      throw new NotFoundException(`No video fragment found for camera ${cameraIp} at time ${time}`);
    }
    return VideoMapper.fromEntityToDomain(video);
  }

  async getOldestVideoRecord(): Promise<Video | null> {
    const video = await this.videoRepository.findOne({
      order: { createdAt: 'ASC' },
    });
    return VideoMapper.fromEntityToDomain(video);
  }

  async removeVideoRecordAndFile(videoId: number): Promise<void> {
    const record = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!record) return;

    await this.storageService.removeFile(record.filePath);
    await this.videoRepository.delete(videoId);
  }
}
