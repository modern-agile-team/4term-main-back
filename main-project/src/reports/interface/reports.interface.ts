export interface ReportDetail {
  reportNo: number;
  targetBoardNo?: number;
  targetUserNo?: number;
}

export interface ReportCreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface ReportReadResponse {
  no: number;
  title: string;
  description: string;
  userNo: number;
  targetBoardNo?: number;
  targetUserNo?: number;
}
