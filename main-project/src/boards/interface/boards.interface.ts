export interface BoardCreateResponse {
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
  meetingNo: number;
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
}

export interface BookmarkDetail {
  boardNo: number;
  userNo: number;
}
