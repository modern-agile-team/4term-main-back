import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EnquiryDto } from '../dto/enquiry.dto';
import { Enquiries } from '../entity/enquiry.entity';
import {
  EnquiryIF,
} from '../interface/enquiry.interface';

@EntityRepository(Enquiries)
export class EnquiryRepository extends Repository<Enquiries> {
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<EnquiryIF[]> {
    try {
      const enquiries = this.createQueryBuilder('enquiries')
        .leftJoin('enquiries.userNo', 'users')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
        ])
        .orderBy('no', 'DESC')
        .getRawMany();

      return enquiries;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEnquiries-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiriesByNo(enquiryNo: number): Promise<EnquiryIF> {
    try {
      const enquiry = this.createQueryBuilder('enquiries')
        .leftJoin('enquiries.userNo', 'users')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
        ])
        .where('enquiries.no = :enquiryNo', { enquiryNo })
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
    enquiry: EnquiryIF,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('eqnuiries')
        .insert()
        .into(Enquiries)
        .values(enquiry)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //문의사항 수정 관련
  async updateEnquiry(
    enquiryNo: number,
    enquiry: EnquiryDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Enquiries)
        .set(enquiry)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEnquiry-repository: 알 수 없는 서버 에러입니다.`,
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
