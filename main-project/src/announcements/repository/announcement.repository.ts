import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Announcements } from '../entity/announcement.entity';
import { AnnouncementIF } from '../interface/announcement.interface';

@EntityRepository(Announcements)
export class AnnouncementsRepository extends Repository<Announcements> {
  // 공지사항 조회 관련
  async getAnnouncements(type: number): Promise<AnnouncementIF[]> {
    try {
      const announcements = this.createQueryBuilder('announcements')
        .select([
          'announcements.no AS no',
          'announcements.title AS title',
          'announcements.description AS description',
          'announcements.type AS type',
        ])
        .orderBy('no', 'DESC');
      if (type) {
        announcements.where('type = :type', { type });
      }

      return announcements.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllAnnouncements-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnnouncementByNo(announcementNo: number): Promise<AnnouncementIF> {
    try {
      const announcements = this.createQueryBuilder('announcements')
        .select([
          'announcements.no AS no',
          'announcements.title AS title',
          'announcements.description AS description',
        ])
        .where('no = :announcementNo', { announcementNo })
        .getRawOne();

      return announcements;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnouncementByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
