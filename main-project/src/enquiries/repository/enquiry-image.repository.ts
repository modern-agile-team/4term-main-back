import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EnquiryImages } from '../entity/enquiry-images.entity';

@EntityRepository(EnquiryImages)
export class EnquiryImagesRepository extends Repository<EnquiryImages> {
  //Get Methods
  async getAllEnquiryImages(): Promise<EnquiryImages[]> {
    try {
      const images = await this.createQueryBuilder()
        .leftJoin('enquiries.userNo', 'users')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
          `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .orderBy('no', 'DESC')
        .getRawMany();

      return images;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiryImagesByNo(enquiryNo: number): Promise<EnquiryImages> {
    try {
      const images = await this.createQueryBuilder('enquiries')
        .leftJoin('enquiries.userNo', 'users')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
          `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .where('enquiries.no = :enquiryNo', { enquiryNo })
        .getRawOne();

      return images;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEnquiryImagesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //문의사항 생성 관련
  async setEnquiryImages(images): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(EnquiryImages)
        .values(images)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} setEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteEnquiryImages(enquiryNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(EnquiryImages)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
