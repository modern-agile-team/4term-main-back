import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UpdateEnquiryDto } from '../dto/update-enquiry.dto';
import { EnquiryImages } from '../entity/enquiry-images.entity';
import { Enquiries } from '../entity/enquiry.entity';

@EntityRepository(EnquiryImages)
export class EnquiryImagesRepository extends Repository<EnquiryImages> {
  // 문의사항 조회 관련
  async getAllEnquiryImages(): Promise<Enquiries[]> {
    try {
      const enquiries = this.createQueryBuilder()
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

      return enquiries;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiryImagesByNo(enquiryNo: number): Promise<Enquiries> {
    try {
      const enquiry = this.createQueryBuilder('enquiries')
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

      return enquiry;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEnquiryImagesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //문의사항 생성 관련
  async uploadEnquiryImages(enquiry): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Enquiries)
        .values(enquiry)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} uploadEnquiryImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 문의사항 삭제 관련
  async deleteEnquiryImages(enquiryNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Enquiries)
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
