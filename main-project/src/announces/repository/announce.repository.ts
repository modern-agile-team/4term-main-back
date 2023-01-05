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
  async getAnnounces(type: number): Promise<Announces[]> {
    try {
      const announces = this.createQueryBuilder('announces')
        .select([
          'announces.no AS no',
          'announces.title AS title',
          'announces.description AS description',
          'announces.type AS type',
        ])
        .orderBy('no', 'DESC');
      if (type) {
        announces.where('type = :type', { type });
      }

      return announces.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnnouncesByNo(announcesNo: number): Promise<Announces> {
    try {
      const announces = this.createQueryBuilder('announces')
        .select([
          'announces.no AS no',
          'announces.title AS title',
          'announces.description AS description',
        ])
        .where('no = :announcesNo', { announcesNo })
        .getRawOne();

      return announces;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnouncesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //공지사항 생성 관련
  async createAnnounces(announcesDto: AnnouncesDto): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('announces')
        .insert()
        .into(Announces)
        .values(announcesDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //공지사항 수정 관련
  async updateAnnounces(
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('boards')
        .update(Announces)
        .set(announcesDto)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
