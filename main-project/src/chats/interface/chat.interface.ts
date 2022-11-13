export interface CreateChat {
  userNo?: number;
  meetingNo: number;
  roomName?: string;
}

export interface JoinChatRoom {
  userNo: number;
  chatRoomNo: number;
}

export interface MessagePayload {
  message?: string;
  chatRoomNo: number;
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

export interface ChatRoomUsers {
  chatRoomNo: number;
  nickname: string;
  roomName: string;
  meetingNo: number;
  userNo: number;
}

export interface ChatRoomList {
  roomName: string;
  chatRoomNo: number;
}

export interface PreviousChatLog {
  userNo: number;
  currentChatLogNo?: number;
  chatRoomNo: number;
  message?: string;
  timeStamp?: Date;
}

export interface ChatUserInfo {
  userNo: number;
  chatRoomNo: number;
}
