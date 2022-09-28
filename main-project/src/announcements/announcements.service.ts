import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementCreateResponse } from './interface/announcement.interface';
import { AnnouncementsRepository } from './repository/announcement.repository';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementsRepository)
    private readonly announcementsRepository: AnnouncementsRepository,
  ) {}

  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: AnnouncementCreateResponse =
        await this.announcementsRepository.createAnnouncement(
          createAnnouncementDto,
        );

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`공지사항 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }
}
