import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { Connection, QueryRunner } from 'typeorm';
import { EnquiryDto } from './dto/enquiry.dto';
import {
  EnquiryIF,
} from './interface/enquiry.interface';
import { EnquiryRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(EnquiryRepository)
    private readonly enquiryRepository: EnquiryRepository,

    private readonly connection: Connection,
  ) { }
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<EnquiryIF[]> {
    const enquiries: EnquiryIF[] =
      await this.enquiryRepository.getAllEnquiries();

    if (!enquiries) {
      throw new NotFoundException(
        `문의 전체 조회(getAllEnquiries): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiriesByNo(enquiryNo: number): Promise<EnquiryIF> {
    const enquiry: EnquiryIF =
      await this.enquiryRepository.getEnquiriesByNo(enquiryNo);

    if (!enquiry) {
      throw new NotFoundException(
        `문의 상세 조회(getEnquiriesByNo): ${enquiryNo}번 문의 사항이 없습니다.`,
      );
    }

    return enquiry;
  }

  // 문의사항 생성 관련
  async createEnquiry(enquiry: EnquiryDto, userNo: number): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const enquiryDetail: EnquiryIF = {
        ...enquiry,
        userNo,
      };

      const { affectedRows, insertId }: CreateResponse =
        await queryRunner.manager.getCustomRepository(EnquiryRepository).createEnquiry(enquiryDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(
          `문의 사항 생성(createEnquiry): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return insertId;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  //게시글 수정 관련
  async updateEnquiry(
    enquiryNo: number,
    enquiryDto: EnquiryDto,
  ): Promise<string> {
    try {
      await this.getEnquiriesByNo(enquiryNo);
      const eqnuiry: number = await this.enquiryRepository.updateEnquiry(
        enquiryNo,
        enquiryDto,
      );

      if (!eqnuiry) {
        throw new InternalServerErrorException(
          `문의사항 수정 오류 updateEnquiry-service.`,
        );
      }

      return `${enquiryNo}번 문의사항이 수정되었습니다.`;
    } catch (error) {
      throw error;
    }
  }

  //문의사항 삭제 관련
  async deleteEnquiryByNo(enquiryNo: number): Promise<string> {
    try {
      await this.getEnquiriesByNo(enquiryNo);
      await this.enquiryRepository.deleteEnquiryByNo(enquiryNo);

      return `${enquiryNo}번 게시글 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
