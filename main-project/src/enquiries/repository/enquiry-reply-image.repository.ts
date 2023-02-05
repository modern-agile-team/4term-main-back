import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { EnquiryReplyImages } from '../entity/enquiry-reply-images.entity';
import { ReplyImage } from '../interface/enquiry.interface';

@EntityRepository(EnquiryReplyImages)
export class EnquiryReplyImagesRepository extends Repository<EnquiryReplyImages> {
  //문의사항 생성 관련
  async setReplyImages(images: ReplyImage<string>[]): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(EnquiryReplyImages)
        .values(images)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} setReplyImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteReplyImages(replyNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(EnquiryReplyImages)
        .where('reply_no = :replyNo', { replyNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReplyImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
