export interface CreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface BoardReadResponse {
  no: number;
  hostUserNo: number;
  nickname: string;
  title: string;
  isDone: boolean;
  description: string;
  location: string;
  meetingTime: Date;
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

export interface BoardAndUserNumber {
  boardNo: number;
  userNo: number;
}

export interface HostMembers {
  boardNo: number,
  userNo: number,
  hosts: number[],
}

export interface GuestApplication {
  boardNo: number;
  guests: [];
}

export interface NoticeBoard {
  boardNo: number;
  noticeNo: number
}

export interface UserNo {
  no: number
}



