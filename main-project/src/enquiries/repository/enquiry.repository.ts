import { InternalServerErrorException } from '@nestjs/common';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { Enquiries } from '../entity/enquiry.entity';
import {
  EnquiryCreateResponse,
  EnquiryDetail,
  EnquiryReadResponse,
} from '../interface/enquiry.interface';

@EntityRepository(Enquiries)
export class EnquiryRepository extends Repository<Enquiries> {
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<EnquiryReadResponse[]> {
    try {
      const enquiries = this.createQueryBuilder('enquiries')
        .select([
          'enquiries.no AS no',
          'enquiries.userNo AS user_no',
          'enquiries.title AS title',
          'enquiries.description AS description',
        ])
        .orderBy('enquiries.no', 'DESC')
        .getRawMany();

      return enquiries;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEnquiries-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiriesByNo(enquiryNo: number): Promise<EnquiryReadResponse> {
    try {
      const enquiry = this.createQueryBuilder('enquiries')
        .select([
          'enquiries.no AS no',
          'enquiries.userNo AS user_no',
          'enquiries.title AS title',
          'enquiries.description AS description',
        ])
        .where('no=:enquiryNo', { enquiryNo })
        .getRawOne();

      return enquiry;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEnquiriesByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //문의사항 생성 관련
  async createEnquiry(
    enquiryDetail: EnquiryDetail,
  ): Promise<EnquiryCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('eqnuiries')
        .insert()
        .into(Enquiries)
        .values(enquiryDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 문의사항 삭제 관련
  async deleteEnquiryByNo(enquiryNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'enquiries',
      )
        .delete()
        .from(Enquiries)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiryByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
