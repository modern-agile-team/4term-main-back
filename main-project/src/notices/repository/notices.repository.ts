import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { Notices } from '../entity/notices.entity';
import { NoticeDetail, NoticeResponse } from '../interface/notice.interface';

@EntityRepository(Notices)
export class NoticesRepository extends Repository<Notices> {
  async saveNotice(noticeInfo: NoticeDetail): Promise<NoticeResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('notices')
        .insert()
        .into(Notices)
        .values(noticeInfo)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNotice): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async getNoticeById(noticeNo: number): Promise<Notices> {
    try {
      const notice: Notices = await this.createQueryBuilder('notices')
        .where('notices.no = :noticeNo', { noticeNo })
        .getOne();

      return notice;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 조회 에러(getNoticeById): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
