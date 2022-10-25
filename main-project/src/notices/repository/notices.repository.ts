import { InternalServerErrorException } from '@nestjs/common';
import { NoticeType } from 'src/common/configs/notice-type.config';
import {
  InsertRaw,
  MeetingUser,
} from 'src/meetings/interface/meeting.interface';
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
  NoticeGuests,
  NoticeMeeting,
} from '../interface/notice.interface';

@EntityRepository(Notices)
export class NoticesRepository extends Repository<Notices> {
  async getNoticeInvitation(
    userNo: number,
    noticeNo: number,
  ): Promise<NoticeMeeting> {
    try {
      const noticeMeeting: NoticeMeeting = await this.createQueryBuilder(
        'notices',
      )
        .leftJoin(
          'notices.noticeMeetings',
          'noticeMeetings',
          'notices.no = noticeMeetings.noticeNo',
        )
        .select([
          'notices.no AS noticeNo',
          'notices.type AS type',
          'noticeMeetings.meetingNo AS meetingNo',
          'notices.targetUserNo AS targetUserNo',
        ])
        .where('notices.no = :noticeNo AND notices.userNo = :userNo', {
          noticeNo,
          userNo,
        })
        .andWhere(
          `notices.type = ${NoticeType.INVITE_GUEST} 
          OR notices.type = ${NoticeType.INVITE_HOST}`,
        )
        .getRawOne();

      return noticeMeeting;
    } catch (err) {
      throw err;
    }
  }

  async getApplicationGuests(noticeNo: number): Promise<NoticeGuests> {
    try {
      const result = await this.createQueryBuilder('notices')
        .leftJoin(
          'notices.noticeMeetings',
          'noticeMeetings',
          'notices.no = noticeMeetings.noticeNo',
        )
        .leftJoin(
          'notices.noticeGuests',
          'noticeGuests',
          'notices.no = noticeGuests.noticeNo',
        )
        .select([
          'notices.no AS noticeNo',
          'noticeMeetings.meetingNo AS meetingNo',
          'notices.targetUserNo AS adminGuest',
          `JSON_ARRAYAGG(noticeGuests.userNo) AS guests`,
        ])
        .where(`notices.no = :noticeNo AND notices.type =:type`, {
          noticeNo,
          type: NoticeType.APPLY_FOR_MEETING,
        })
        .groupBy('notices.no')
        .getRawOne();

      return result;
    } catch (err) {
      throw err;
    }
  }

  async saveGuestNotice(noticeInfo: NoticeDetail): Promise<InsertRaw> {
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

  async getApplication({ meetingNo, userNo }: MeetingUser): Promise<Notice> {
    try {
      const notice: Notice = await this.createQueryBuilder('notices')
        .leftJoin(
          'notices.noticeMeetings',
          'noticeMeetings',
          'notices.no = noticeMeetings.noticeNo',
        )
        .select('notices.no AS noticeNo')
        .where(
          `noticeMeetings.meetingNo = :meetingNo 
          AND notices.targetUserNo = :userNo AND notices.type = :type`,
          { meetingNo, userNo, type: NoticeType.APPLY_FOR_MEETING },
        )
        .getRawOne();

      return notice;
    } catch (err) {
      throw err;
    }
  }

  async saveNotice(noticeInfo: NoticeDetail): Promise<InsertRaw> {
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
