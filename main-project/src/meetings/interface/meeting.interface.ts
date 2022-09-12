export interface MeetingResponse {
  affectedRows: number;
  insertId?: number;
}

export interface MeetingDetail {
  location: string;
  time: Date;
}
