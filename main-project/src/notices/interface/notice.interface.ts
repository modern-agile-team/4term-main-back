export interface NoticeResponse {
  affectedRows: number;
  insertId?: number;
}

export interface NoticeDetail {
  userNo: number;
  targetUserNo: number;
  type: number;
  value: string;
}

export interface NoticeConditions {
  userNo: number;
  targetUserNo: number;
  type: number;
}
