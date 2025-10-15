import { IMediaService, MediaFile, CreateMediaFileData } from '../interfaces/media.interface';
import { MediaFileRepository } from '../interfaces/media.interface';
import { logger } from '../config/logger';

export class MediaService implements IMediaService {
  private mediaRepository: MediaFileRepository;

  constructor(mediaRepository: MediaFileRepository) {
    this.mediaRepository = mediaRepository;
  }

  async uploadMedia(data: CreateMediaFileData, tenantId: string, userId: string): Promise<MediaFile> {
    try {
      logger.info('Media upload requested', { fileName: data.fileName, tenantId, userId });
      
      // Create media file in database using repository
      const mediaFileData = {
        ...data,
        isEncrypted: data.isEncrypted ?? false,
      };
      const mediaFile = await this.mediaRepository.create(mediaFileData);
      
      logger.info('Media file created successfully', { id: mediaFile.id, fileName: data.fileName });
      return mediaFile;
    } catch (error) {
      logger.error('Media upload failed', { error, fileName: data.fileName });
      throw error;
    }
  }

  async getMediaById(id: string, tenantId: string): Promise<MediaFile | null> {
    try {
      logger.info('Media retrieval requested', { id, tenantId });
      const mediaFile = await this.mediaRepository.findById(id);
      return mediaFile;
    } catch (error) {
      logger.error('Media retrieval failed', { id, tenantId, error });
      throw error;
    }
  }

  async getMediaByDevice(deviceId: string, tenantId: string, options?: any): Promise<any> {
    try {
      logger.info('Device media listing requested', { deviceId, tenantId, options });
      const result = await this.mediaRepository.findByDevice(deviceId, options);
      return result;
    } catch (error) {
      logger.error('Device media listing failed', { deviceId, tenantId, error });
      throw error;
    }
  }

  async deleteMedia(id: string, tenantId: string): Promise<void> {
    try {
      logger.info('Media deletion requested', { id, tenantId });
      await this.mediaRepository.delete(id);
      logger.info('Media file deleted successfully', { id });
    } catch (error) {
      logger.error('Media deletion failed', { id, tenantId, error });
      throw error;
    }
  }
}
