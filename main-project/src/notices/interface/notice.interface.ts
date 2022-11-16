export interface NoticeResponse {
  affectedRows: number;
  insertId?: number;
}

export interface NoticeDetail {
  userNo: number;
  targetUserNo: number;
  type: number;
}

export interface NoticeConditions {
  userNo: number;
  targetUserNo?: number;
  type?: number;
}

export interface Notice {
  noticeNo?: number;
  userNo?: number;
  targetUserNo: number;
  type?: number;
  meetingNo?: number;
  guest?: any;
  createdDate?: Date;
  isRead?: boolean;
}

export interface NoticeMeetingDetail {
  meetingNo: number;
  noticeNo: number;
}

export interface NoticeGuestDetail {
  noticeNo: number;
  userNo: number;
}

export interface NoticeGuests {
  noticeNo: number;
  meetingNo: number;
  adminGuest: number;
  guests: any;
}

export interface NoticeMeeting {
  noticeNo: number;
  meetingNo: number;
  targetUserNo: number;
  type: number;
}

export interface NoticeChatsInfo {
  chatRoomNo: number;
  noticeNo: number;
}
