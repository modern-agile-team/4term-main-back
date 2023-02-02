import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { AnnouncesDto } from '../dto/announce.dto';
import { Announces } from '../entity/announce.entity';
import { Announce } from '../interface/announces.interface';

@EntityRepository(Announces)
export class AnnouncesRepository extends Repository<Announces> {
  //  조회 관련
  async getAllAnnounces(): Promise<Announce<string[]>[]> {
    try {
      const announces: Announce<string>[] = await this.createQueryBuilder(
        'announces',
      )
        .leftJoin('announces.announcesImages', 'images')
        .select([
          'announces.no AS no',
          'announces.title AS title',
          'announces.description AS description',
          'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
        ])
        .orderBy('no', 'DESC')
        .groupBy('announces.no')
        .getRawMany();

      const convertAnnounces: Announce<string[]>[] = announces.map(
        ({ imageUrls, ...announceInfo }) => {
          const announce: Announce<string[]> = {
            ...announceInfo,
            imageUrls: JSON.parse(imageUrls),
          };

          return announce;
        },
      );

      return convertAnnounces;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnnouncesByNo(announcesNo: number): Promise<Announces> {
    try {
      const announces: Announces = await this.createQueryBuilder('announces')
        .leftJoin('announces.announcesImages', 'images')
        .select([
          'announces.no AS no',
          'announces.title AS title',
          'announces.description AS description',
          'JSON_ARRAYAGG(images.imageUrl) AS images',
        ])
        .where('announces.no = :announcesNo', { announcesNo })
        .getRawOne();

      return announces;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnouncesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createAnnounces(announcesDto: AnnouncesDto): Promise<ResultSetHeader> {
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

  // 수정 관련
  async updateAnnounces(
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<UpdateResult> {
    try {
      const raw: UpdateResult = await this.createQueryBuilder('boards')
        .update(Announces)
        .set(announcesDto)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesByNo(announcesNo: number): Promise<DeleteResult> {
    try {
      const raw: DeleteResult = await this.createQueryBuilder('announces')
        .delete()
        .from(Announces)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnouncesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
