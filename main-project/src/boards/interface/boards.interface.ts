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
  meetingTime: Date;
  meetingNo: number;
  userNo: number;
}

export interface BoardMemberDetail {
  boardNo?: number;
  male: number;
  female: number;
}

export interface BookmarkDetail {
  boardNo: number;
  userNo: number;
}
