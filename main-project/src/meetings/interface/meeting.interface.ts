import { Users } from 'src/users/entity/user.entity';
import { Meetings } from '../entity/meeting.entity';

export interface MeetingResponse {
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

export interface ParticipatingMembers {
  isDone?: boolean;
  adminHost?: number;
  adminGuest?: number;
  guestHeadcount?: number;
  hostHeadcount?: number;
  guests?: string;
  hosts?: string;
  addGuestAvailable?: boolean;
  addHostAvailable?: boolean;
}

export interface InviteNoticeResult {
  meetingNo: number;
  side: string;
}

export interface MeetingVacancy {
  addGuestAvailable?: string;
  addHostAvailable?: string;
}

export interface ChangeAdminGuest {
  userNo: number;
  adminGuest: number;
  meetingNo: number;
  newAdminGuest: number;
}
