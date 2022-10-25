import { Users } from 'src/users/entity/user.entity';
import { QueryRunner } from 'typeorm';
import { Meetings } from '../entity/meeting.entity';

export interface InsertRaw {
  affectedRows: number;
  insertId?: number;
}

export interface MeetingDetail {
  location: string;
  time: Date;
}

export interface MeetingMemberDetail {
  host: Users | number;
  meetingNo: Meetings | number;
  hostHeadcount: number;
  guestHeadcount: number;
}

export interface MeetingVacancy {
  addGuestAvailable: boolean;
  addHostAvailable: boolean;
}

export interface InviteNoticeResult {
  meetingNo: number;
  side: string;
}

export interface Members {
  members: string;
}

export interface MeetingUser {
  meetingNo: number;
  userNo: number;
}

export interface NoticeGuestParam {
  noticeNo: number;
  guest: number[];
  queryRunner: QueryRunner;
}
