import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateEnquiryDto } from '../dto/create-enquiry.dto';
import { UpdateEnquiryDto } from '../dto/update-enquiry.dto';
import { Enquiries } from '../entity/enquiry.entity';

@EntityRepository(Enquiries)
export class EnquirysRepository extends Repository<Enquiries> {
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<Enquiries[]> {
    try {
      const enquiries = this.createQueryBuilder('enquiries')
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
        `${error} getAllEnquiries-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiryByNo(enquiryNo: number): Promise<Enquiries> {
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
        `${error} getEnquiryByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //문의사항 생성 관련
  async createEnquiry(enquiry): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
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
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: UpdateResult = await this.createQueryBuilder()
        .update(Enquiries)
        .set(updateEnquiryDto)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 문의사항 삭제 관련
  async deleteEnquiry(enquiryNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Enquiries)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
