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
import { EnquiryReplies } from '../entity/enquiry-reply.entity';

@EntityRepository(EnquiryReplies)
export class EnquiryRepliesRepository extends Repository<EnquiryReplies> {
  //Get Methods
  async getAllReplies(): Promise<EnquiryReplies[]> {
    try {
      const replies: EnquiryReplies[] = await this.createQueryBuilder()
        .orderBy('no', 'DESC')
        .getMany();

      return replies;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllReplies-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getReplyByNo(enquiryNo: number): Promise<EnquiryReplies> {
    try {
      const reply: EnquiryReplies = await this.createQueryBuilder()
        .select([
          'no AS no',
          'title AS title',
          'description AS description',
          'created_date AS createdDate',
        ])
        .where('enquiry_no = :enquiryNo', { enquiryNo })
        .getRawOne();

      return reply;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReplyByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Post Methods
  async createReply(reply): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(EnquiryReplies)
        .values(reply)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Patch Methods
  async updateReply(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: UpdateResult = await this.createQueryBuilder()
        .update(EnquiryReplies)
        .set(updateEnquiryDto)
        .where('enquiryNo = :enquiryNo', { enquiryNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteReply(enquiryNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(EnquiryReplies)
        .where('enquiryNo = :enquiryNo', { enquiryNo })
        .execute();
      console.log(affected);

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
