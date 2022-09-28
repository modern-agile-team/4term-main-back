import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EnquiryDto } from './dto/enquiry.dto';
import {
  EnquiryCreateResponse,
  EnquiryDetail,
} from './interface/enquiry.interface';
import { EnquiryRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(EnquiryRepository)
    private readonly enquiryRepository: EnquiryRepository,
  ) {}

  async createEnquiry(enquiryDto: EnquiryDto, userNo: number): Promise<number> {
    try {
      const enquiryDetail: EnquiryDetail = {
        ...enquiryDto,
        userNo,
      };

      const { affectedRows, insertId }: EnquiryCreateResponse =
        await this.enquiryRepository.createEnquiry(enquiryDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`enquiry 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }
}
