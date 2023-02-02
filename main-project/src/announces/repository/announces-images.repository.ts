import { InternalServerErrorException } from '@nestjs/common';
import { DeleteResult, EntityRepository, Repository } from 'typeorm';
import { AnnounceImages } from '../entity/announce-images.entity';
import { AnnounceImage } from '../interface/announces.interface';

@EntityRepository(AnnounceImages)
export class AnnouncesImagesRepository extends Repository<AnnounceImages> {
  // 조회 관련
  async getAnnouncesImages(announcesNo: number): Promise<AnnounceImages> {
    try {
      const images: AnnounceImages = await this.createQueryBuilder(
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
  async createAnnounceImages(images: AnnounceImage[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(AnnounceImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnounceImages-repository: 알 수 없는 서버 에러입니다.`,
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
        .from(AnnounceImages)
        .where('announcesNo = :announcesNo', { announcesNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnouncesImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
