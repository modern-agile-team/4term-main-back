export interface EnquiryCreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface EnquiryDetail {
  userNo: number;
  title: string;
  description: string;
}
