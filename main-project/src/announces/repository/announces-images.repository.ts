import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
<<<<<<< HEAD
import { CreateResponse } from 'src/boards/interface/boards.interface';
=======
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { AnnouncesImages } from '../entity/announce-images.entity';

@EntityRepository(AnnouncesImages)
export class AnnouncesImagesRepository extends Repository<AnnouncesImages> {
  // 조회 관련
  async getAnnouncesImages(announcesNo: number): Promise<AnnouncesImages> {
    try {
      const images: AnnouncesImages = await this.createQueryBuilder(
        'announcesImages',
      )
        .select(['JSON_ARRAYAGG(announcesImages.imageUrl) AS imageUrl'])
        .where('announcesImages.announcesNo = :announcesNo', { announcesNo })
        .getRawOne();

      return images;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnouncesImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // 생성 관련
  async uploadImageUrls(
    images: { announcesNo: number; imageUrl: string }[],
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'announcesImages',
      )
        .insert()
        .into(AnnouncesImages)
        .values(images)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} uploadImageUrls-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesImages(announcesNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder(
        'announcesImages',
      )
        .delete()
        .from(AnnouncesImages)
        .where('announcesNo = :announcesNo', { announcesNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnouncesImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
