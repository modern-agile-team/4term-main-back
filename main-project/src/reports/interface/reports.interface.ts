export interface BoardReportDetail {
  reportNo: number;
  targetBoardNo: number;
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
  targetBoardNo?:number;
  targetuserNo?:number;
}
// export interface ReportedBoardResponse{
//   no:number;
//   reportNo:number;
//   targetBoardNo:number;
// }

// export interface ReportedUserResponse{
//   no:number;
//   reportNo:number;
//   targetuserNo:number;
// }
