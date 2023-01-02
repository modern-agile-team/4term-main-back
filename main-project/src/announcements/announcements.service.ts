import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { Connection, QueryRunner } from 'typeorm';
import { AnnouncementFilterDto } from './dto/announcement-filter.dto';
import { AnnouncementDto } from './dto/announcement.dto';
import { Announcements } from './entity/announcement.entity';
import { AnnouncementIF } from './interface/announcement.interface';
import { AnnouncementsRepository } from './repository/announcement.repository';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementsRepository)
    private readonly announcementsRepository: AnnouncementsRepository,

    private readonly connection: Connection,
  ) {}
  // 공지사항 생성 관련
  async createAnnouncement(announcementDto: AnnouncementDto): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const announcementNo: CreateResponse = await queryRunner.manager
        .getCustomRepository(AnnouncementsRepository)
        .createAnnouncement(announcementDto);

      await queryRunner.commitTransaction();

      return `${announcementNo}번 공지사항 생성 성공`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  // 공지사항 조회 관련
  async getAnnouncements({
    type,
  }: AnnouncementFilterDto): Promise<Announcements[]> {
    const announcements: Announcements[] =
      await this.announcementsRepository.getAnnouncements(type);

    if (announcements.length === 0) {
      throw new NotFoundException(
        `공지사항 조회(getAnnouncements-service): 조건에 맞는 공지사항이 없습니다.`,
      );
    }

    return announcements;
  }

  async getAnnouncementByNo(announcementNo: number): Promise<Announcements> {
    const announcement: Announcements =
      await this.announcementsRepository.getAnnouncementByNo(announcementNo);

    if (!announcement) {
      throw new NotFoundException(
        `공지사항 상세 조회(getBoardByNo-service): ${announcementNo}번 공지사항이 없습니다.`,
      );
    }

    return announcement;
  }
}
