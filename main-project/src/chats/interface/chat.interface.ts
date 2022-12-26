import { IsNumber } from 'class-validator';

export interface MeetingMembersList {
  hostUserNo: number[];
  guestUserNo: number[];
}

export class CreateChat {
  userNo?: number;
  @IsNumber()
  boardNo: number;
  roomName?: string;
}

export interface JoinChatRoom {
  userNo: number;
  chatRoomNo: number;
}

export interface MessagePayload {
  userNo: number;
  chatRoomNo: number;
  message?: string;
  uploadedFileUrls?: string[];
}

export interface FileUrlDetail {
  chatLogNo: number;
  fileUrl: string;
}

export interface ChatRoom {
  guestNickname?: string;
  hostNickname?: string;
  roomName?: string;
  userNo?: string;
  guestUserNo?: string;
  hostUserNo?: string;
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
  userNo?: number;
  chatRoomNo: number;
  userType?: number;
  type?: number;
}
