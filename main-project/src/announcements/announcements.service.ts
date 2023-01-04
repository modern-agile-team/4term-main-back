import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AnnouncementIF,
} from './interface/announcement.interface';
import { AnnouncementsRepository } from './repository/announcement.repository';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementsRepository)
    private readonly announcementsRepository: AnnouncementsRepository,

  ) { }
  // 공지사항 조회 관련
  async getAllAnnouncements(): Promise<AnnouncementIF[]> {
    const announcements: AnnouncementIF[] =
      await this.announcementsRepository.getAllAnnouncements();

    if (announcements.length === 0) {
      throw new NotFoundException(`전체 조회(getAllAnnouncements): 공지사항이 없습니다.`);
    }

    return announcements;
  }

  async getAnnouncementByNo(
    announcementNo: number,
  ): Promise<AnnouncementIF> {
    const announcement: AnnouncementIF =
      await this.announcementsRepository.getAnnouncementByNo(announcementNo);

    if (!announcement) {
      throw new NotFoundException(`공지사항 상세 조회(getBoardByNo): ${announcementNo}번 공지사항이 없습니다.`);
    }

    return announcement;
  }
}
