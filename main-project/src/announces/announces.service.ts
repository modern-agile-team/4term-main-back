import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { Connection, QueryRunner } from 'typeorm';
import { AnnouncesFilterDto } from './dto/announce-filter.dto';
import { AnnouncesDto } from './dto/announce.dto';
import { Announces } from './entity/announce.entity';
import { AnnouncesRepository } from './repository/announce.repository';

@Injectable()
export class AnnouncesService {
  constructor(
    @InjectRepository(AnnouncesRepository)
    private readonly announcesRepository: AnnouncesRepository,

    private readonly connection: Connection,
  ) {}
  // 공지사항 생성 관련
  async createAnnouncement(announcementDto: AnnouncesDto): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { insertId }: CreateResponse = await queryRunner.manager
        .getCustomRepository(AnnouncesRepository)
        .createAnnouncement(announcementDto);

      if (!insertId) {
        throw new InternalServerErrorException(
          `공지사항 생성(createAnnouncement-service): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return `${insertId}번 공지사항 생성 성공`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  // 공지사항 조회 관련
  async getAnnouncements({ type }: AnnouncesFilterDto): Promise<Announces[]> {
    const announcements: Announces[] =
      await this.announcesRepository.getAnnouncements(type);

    if (announcements.length === 0) {
      throw new NotFoundException(
        `공지사항 조회(getAnnouncements-service): 조건에 맞는 공지사항이 없습니다.`,
      );
    }

    return announcements;
  }

  async getAnnouncementByNo(announcementNo: number): Promise<Announces> {
    const announcement: Announces =
      await this.announcesRepository.getAnnouncementByNo(announcementNo);

    if (!announcement) {
      throw new NotFoundException(
        `공지사항 상세 조회(getBoardByNo-service): ${announcementNo}번 공지사항이 없습니다.`,
      );
    }

    return announcement;
  }

  // 공지사항 수정 관련
  async updateAnnouncement(
    announcementNo: number,
    announcementDto: AnnouncesDto,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getAnnouncementByNo(announcementNo);

      const affectedRows: number = await queryRunner.manager
        .getCustomRepository(AnnouncesRepository)
        .updateAnnouncement(announcementNo, announcementDto);

      if (!affectedRows) {
        throw new InternalServerErrorException(
          `공지사항 수정(updateAnnouncement-service): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return `${announcementNo}번 공지사항이 수정되었습니다.`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }
}
