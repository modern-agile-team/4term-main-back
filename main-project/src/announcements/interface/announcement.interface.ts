export interface AnnouncementCreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface AnnouncementReadResponse {
  no: number;
  title: string;
  description: string;
}
