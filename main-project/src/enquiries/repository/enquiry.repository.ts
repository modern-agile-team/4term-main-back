import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { Enquiries } from '../entity/enquiry.entity';
import {
  EnquiryCreateResponse,
  EnquiryDetail,
} from '../interface/enquiry.interface';

@EntityRepository(Enquiries)
export class EnquiryRepository extends Repository<Enquiries> {
  //게시글 생성 관련
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
}
