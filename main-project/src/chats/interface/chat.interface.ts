export interface ChatToCreate {
  boardNo: number;
  userNo?: number;
  roomName?: string;
}

export interface ChatRoom {
  roomName: string;
  chatRoomNo: number;
}

export interface ChatUser {
  userNo: number;
  chatRoomNo: number;
  userType?: number;
  targetUserNo?: number;
  type?: number;
}

export interface ChatRoomUser {
  userNo: number;
  chatRoomNo: number;
  nickname: string;
  roomName: string;
  meetingNo: number;
}

export interface ChatRoomUsers {
  users: string;
  userType: number;
  chatRoomNo: number;
}

export interface FileUrlDetail {
  chatLogNo: number;
  fileUrl: string;
}

export interface ChatRoomBeforeCreate {
  hostUserNo: string;
  guestUserNo: string;
  hostNickname: string;
  guestNickname: string;
  userNo?: string;
  roomName?: string;
}

export interface PreviousChatLog {
  userNo: number;
  chatRoomNo: number;
  currentChatLogNo?: number;
  message?: string;
  timeStamp?: Date;
}

export interface ChatUserValidation {
  userNo: number;
  chatRoomNo: number;
  isUserNeeded: boolean;
}
