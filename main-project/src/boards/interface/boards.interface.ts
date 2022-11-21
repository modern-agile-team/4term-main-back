import { Users } from 'src/users/entity/user.entity';
import { Boards } from '../entity/board.entity';

export interface CreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface BoardReadResponse {
  no: number;
  title: string;
  isDone: boolean;
  description: string;
  location: string;
  nickname: string;
  meetingTime: Date;
  userNo: number;
}

export interface BoardMemberDetail {
  boardNo?: number;
  male: number;
  female: number;
}

export interface BoardDetail {
  title: string;
  description: string;
  isDone: boolean;
  location: string;
  meetingTime: Date;
  userNo?: number; // host 후에 옵셔널 삭제
}

export interface BookmarkDetail {
  boardNo: number;
  userNo: number;
}

export interface CreateHostMembers {
  boardNo: number;
  userNo: number;
}

export interface HostMembers {
  userNo: [];
  nickname: [];
}
