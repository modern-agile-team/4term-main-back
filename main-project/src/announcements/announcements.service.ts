import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import {
  AnnouncementCreateResponse,
  AnnouncementReadResponse,
} from './interface/announcement.interface';
import { AnnouncementsRepository } from './repository/announcement.repository';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementsRepository)
    private readonly announcementsRepository: AnnouncementsRepository,
  ) {}
  // 공지사항 조회 관련
  async getAllAnnouncements(): Promise<AnnouncementReadResponse[]> {
    try {
      const announcements: AnnouncementReadResponse[] =
        await this.announcementsRepository.getAllAnnouncements();

      if (!announcements) {
        throw new NotFoundException(`전체 공지사항의 조회를 실패 했습니다.`);
      }

      return announcements;
    } catch (error) {
      throw error;
    }
  }

  async getAnnouncementByNo(
    announcementNo: number,
  ): Promise<AnnouncementReadResponse> {
    try {
      const announcement: AnnouncementReadResponse =
        await this.announcementsRepository.getAnnouncementByNo(announcementNo);

      if (!announcement) {
        throw new NotFoundException(
          `${announcementNo}번 공지사항의 조회를 실패 했습니다.`,
        );
      }

      return announcement;
    } catch (error) {
      throw error;
    }
  }

  // 공지사항 생성 관련
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

  // 공지사항삭제 관련
  async deleteAnnouncement(announcementNo: number): Promise<string> {
    try {
      await this.getAnnouncementByNo(announcementNo);
      await this.announcementsRepository.deleteAnnouncement(announcementNo);

      return `${announcementNo}번 공지사항 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
