import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnnouncementDto } from './dto/announcement.dto';
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
        throw new NotFoundException(
          `전체 공지사항 조회 오류 getAllAnnouncements-service.`,
        );
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
          `${announcementNo}번 공지사항 조회 오류 getAnnouncementByNo-service.`,
        );
      }

      return announcement;
    } catch (error) {
      throw error;
    }
  }

  // 공지사항 생성 관련
  async createAnnouncement(
    createAnnouncementDto: AnnouncementDto,
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: AnnouncementCreateResponse =
        await this.announcementsRepository.createAnnouncement(
          createAnnouncementDto,
        );

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(
          `공지사항 생성 오류 createAnnouncement-service.`,
        );
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  // 공지사항 수정 관련
  async updateAnnouncement(
    announcementNo: number,
    announcementDto: AnnouncementDto,
  ): Promise<string> {
    try {
      await this.getAnnouncementByNo(announcementNo);
      const announcement: number =
        await this.announcementsRepository.updateAnnouncement(
          announcementNo,
          announcementDto,
        );

      if (!announcement) {
        throw new InternalServerErrorException(
          `공지사항 수정 오류 updateAnnouncement-service.`,
        );
      }

      return `${announcementNo}번 공지사항이 수정되었습니다.`;
    } catch (error) {
      throw error;
    }
  }

  // 공지사항삭제 관련
  async deleteAnnouncement(announcementNo: number): Promise<string> {
    try {
      await this.getAnnouncementByNo(announcementNo);
      const announcement: number =
        await this.announcementsRepository.deleteAnnouncement(announcementNo);

      if (!announcement) {
        throw new InternalServerErrorException(
          `공지사항 삭제 오류 deleteAnnouncement-service.`,
        );
      }

      return `${announcementNo}번 공지사항 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
