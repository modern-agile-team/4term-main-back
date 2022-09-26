export interface BoardReportDetail {
  reportNo: number;
  targetBoardNo: number;
}

export interface ReportCreateResponse {
  affectedRows: number;
  insertId?: number;
}
