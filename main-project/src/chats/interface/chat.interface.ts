export interface CreateChat {
  userNo?: number;
  meetingNo: number;
  roomName?: string;
}

export interface JoinChatRoom {
  userNo: number;
  meetingNo: number;
}

export interface MessagePayload {
  message?: string;
  meetingNo: number;
  userNo: number;
}

export interface ChatRoom {
  guestUserNickname: string;
  hostUserNickname: string;
  roomName?: string;
  userNo?: string;
  guestUserNo?: number;
  hostUserNo?: number;
}
