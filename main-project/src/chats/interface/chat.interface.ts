export interface CreateChat {
  userNo: number;
  meetingNo: number;
  roomName: string;
}

export interface MessagePayload {
  roomName: string;
  message?: string;
  meetingNo: number;
  userNo: number;
}

export interface ChatRoom {
  guestUserNickname: string;
  hostUserNickname: string;
  roomName?: string;
}
