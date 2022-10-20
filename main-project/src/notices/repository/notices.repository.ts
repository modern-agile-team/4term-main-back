import { InternalServerErrorException } from '@nestjs/common';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Notices } from '../entity/notices.entity';
import {
  Notice,
  NoticeConditions,
  NoticeDetail,
  NoticeResponse,
} from '../interface/notice.interface';

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
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알람 생성 에러(saveNotice): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async getNoticeById(noticeNo: number): Promise<Notice> {
    try {
      const notice: Notice = await this.createQueryBuilder('notices')
        .select([
          'notices.no AS noticeNo',
          'notices.userNo AS userNo',
          'notices.targetUserNo AS targetUserNo',
          'notices.createdDate AS createdDate',
          'notices.type AS type',
          'notices.value AS value',
          'IF(notices.readDatetime, TRUE, FALSE) AS isRead',
        ])
        .where('notices.no = :noticeNo', { noticeNo })
        .getRawOne();

      return notice;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알림 조회 에러(getNoticeById): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async getNoticeByConditions(
    noticeConditions: NoticeConditions,
  ): Promise<Notice[]> {
    try {
      const notices: Notice[] = await this.createQueryBuilder('notices')
        .select([
          'notices.no AS noticeNo',
          'notices.targetUserNo AS targetUserNo',
          'notices.type AS type',
          'IF(notices.readDatetime, TRUE, FALSE) AS isRead',
          'notices.value AS value',
          'notices.createdDate AS createdDate',
        ])
        .where(noticeConditions)
        .getRawMany();

      return notices;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 조건에 해당하는 알림 조회(getNoticeByConditions): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async deleteNotice(no: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Notices)
        .where({ no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알림 삭제 에러(deleteNotice): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async readNotice(no: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Notices)
        .set({ readDatetime: new Date().toISOString() })
        .where({ no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알림 읽음 처리(readNotice): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
