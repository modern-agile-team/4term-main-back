export interface CreateChat {
  roomName: string;
  userNo: number;
  meetingNo: number;
}

export interface MessagePayload {
  roomName: string;
  message?: string;
  meetingNo: number;
  userNo: number;
}
