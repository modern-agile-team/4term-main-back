import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { EnquiryImages } from '../entity/enquiry-images.entity';
import { ImageInfo } from '../interface/enquiry.interface';

@EntityRepository(EnquiryImages)
export class EnquiryImagesRepository extends Repository<EnquiryImages> {
  //문의사항 생성 관련
  async createEnquiryImages(images: ImageInfo<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(EnquiryImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteEnquiryImages(enquiryNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(EnquiryImages)
        .where('enquiryNo = :enquiryNo', { enquiryNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
