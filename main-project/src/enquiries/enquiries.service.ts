import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { Connection } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { Enquiries } from './entity/enquiry.entity';
import { EnquirysRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(private readonly enquirysRepository: EnquirysRepository) {}
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<Enquiries[]> {
    const enquiries: Enquiries[] =
      await this.enquirysRepository.getAllEnquiries();

    if (!enquiries) {
      throw new NotFoundException(
        `문의 전체 조회(getAllEnquiries): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiryByNo(enquiryNo: number): Promise<Enquiries> {
    const enquiry: Enquiries = await this.enquirysRepository.getEnquiryByNo(
      enquiryNo,
    );

    if (!enquiry) {
      throw new NotFoundException(
        `문의 상세 조회(getEnquiryByNo-service): ${enquiryNo}번 문의 사항이 없습니다.`,
      );
    }

    return enquiry;
  }

  // 문의사항 생성 관련
  async createEnquiry(
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
  ): Promise<void> {
    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.createEnquiry({
        ...createEnquiryDto,
        userNo,
      });

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의 사항 생성(createEnquiry-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateEnquiry(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);
    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.updateEnquiry(enquiryNo, updateEnquiryDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의사항 수정 오류 updateEnquiry-service.`,
      );
    }
  }

  //문의사항 삭제 관련
  async deleteEnquiryByNo(enquiryNo: number): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);

    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.deleteEnquiry(enquiryNo);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의사항 삭제 오류 updateEnquiry-service.`,
      );
    }
  }
}
