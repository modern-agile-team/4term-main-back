import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
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
  async getAnnouncesImages(announcesNo: number): Promise<string[]> {
    try {
      const images = this.createQueryBuilder('announcesImages')
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
  async uploadAnnouncesimagesUrl(
    images: { announcesNo: number; imageUrl: string }[],
  ): Promise<CreateResponse> {
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
        `${error} uploadAnnouncesimagesUrl-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesImages(announcesNo: number): Promise<DeleteResult> {
    try {
      const affected: DeleteResult = await this.createQueryBuilder(
        'announcesImages',
      )
        .delete()
        .from(AnnouncesImages)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnouncesImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
