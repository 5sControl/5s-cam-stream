import { Video } from 'src/modules/video/domain/video.domain';

export interface VideoWithOffset extends Video {
  offset: number;
}
