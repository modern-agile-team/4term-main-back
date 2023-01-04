import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { AnnouncesDto } from '../dto/announce.dto';
import { Announces } from '../entity/announce.entity';

@EntityRepository(Announces)
export class AnnouncesRepository extends Repository<Announces> {
  // 공지사항 조회 관련
  async getAnnouncements(type: number): Promise<Announces[]> {
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

  async getAnnouncementByNo(announcementNo: number): Promise<Announces> {
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

  //공지사항 생성 관련
  async createAnnouncement(
    announcementDto: AnnouncesDto,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'announcements',
      )
        .insert()
        .into(Announces)
        .values(announcementDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnouncement-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //공지사항 수정 관련
  async updateAnnouncement(
    announcementNo: number,
    announcementDto: AnnouncesDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('boards')
        .update(Announces)
        .set(announcementDto)
        .where('no = :announcementNo', { announcementNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateAnnouncement-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
