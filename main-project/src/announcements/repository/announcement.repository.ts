import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { Announcements } from '../entity/announcement.entity';
import {
  AnnouncementCreateResponse,
  AnnouncementReadResponse,
} from '../interface/announcement.interface';

@EntityRepository(Announcements)
export class AnnouncementsRepository extends Repository<Announcements> {
  // 공지사항 조회 관련
  async getAllAnnouncements(): Promise<AnnouncementReadResponse[]> {
    try {
      const announcements = this.createQueryBuilder('announcements')
        .select([
          'announcements.no AS no',
          'announcements.title AS title',
          'announcements.description AS description',
        ])
        .orderBy('no', 'DESC')
        .getRawMany();

      return announcements;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllAnnouncements-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnnouncementByNo(
    announcementNo: number,
  ): Promise<AnnouncementReadResponse> {
    try {
      const announcements = this.createQueryBuilder('announcements')
        .select([
          'announcements.no AS no',
          'announcements.title AS title',
          'announcements.description AS description',
        ])
        .where('no=:announcementNo', { announcementNo })
        .getRawOne();

      return announcements;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllAnnouncements-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 공지사항 생성 관련
  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<AnnouncementCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Announcements)
        .values(createAnnouncementDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnouncement-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
