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
import { Enquiries } from '../entity/enquiry.entity';
import { Enquiry } from '../interface/enquiry.interface';

@EntityRepository(Enquiries)
export class EnquiriesRepository extends Repository<Enquiries> {
  //Get Methods
  async getAllEnquiries(): Promise<Enquiry[]> {
    try {
      const enquiries = this.createQueryBuilder('enquiries')
        .leftJoin('enquiries.userNo', 'users')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.isDone AS isDone',
          'enquiries.description AS description',
          `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .orderBy('no', 'DESC')
        .getRawMany();
      //TODO: 공지사항 전체조회 시 이미지 사용하는 지 토의
      return enquiries;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEnquiries-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiryByNo(enquiryNo: number): Promise<Enquiry> {
    try {
      const enquiry = this.createQueryBuilder('enquiries')
        .leftJoin('enquiries.userNo', 'users')
        .leftJoin('enquiries.enquiryImages', 'images')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
          'enquiries.isDone AS isDone',
          `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
          'JSON_ARRAYAGG(images.imageUrl) AS imageUrl',
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

  //Post Methods
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

  //Patch Methods
  async updateEnquiry(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Enquiries)
        .set(updateEnquiryDto)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeEnquiry(no: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Enquiries)
        .set({ isDone: true })
        .where('no = :no', { no })
        .execute();
      console.log(affected);

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} closeEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteEnquiry(enquiryNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Enquiries)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
