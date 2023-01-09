import { IsNumber } from 'class-validator';

export interface MeetingMembersList {
  hostUserNo: number[];
  guestUserNo: number[];
}

export interface ChatToCreate {
  userNo?: number;
  boardNo: number;
  roomName?: string;
}

export interface ChatRoomUsers {
  users: string;
  userType: number;
  chatRoomNo: number;
}

export interface JoinChatRoom {
  userNo: number;
  chatRoomNo: number;
}

export interface FileUrlDetail {
  chatLogNo: number;
  fileUrl: string;
}

export interface ChatRoomToSet {
  guestNickname?: string;
  hostNickname?: string;
  roomName?: string;
  userNo?: string;
  guestUserNo?: string;
  hostUserNo?: string;
}

export interface ChatRoomUser {
  chatRoomNo: number;
  nickname: string;
  roomName: string;
  meetingNo: number;
  userNo: number;
}

export interface ChatRoom {
  roomName: string;
  chatRoomNo: number;
}

export interface PreviousChatLog {
  userNo: number;
  chatRoomNo: number;
  currentChatLogNo?: number;
  message?: string;
  timeStamp?: Date;
}

export interface ChatUserInfo {
  userNo: number;
  chatRoomNo: number;
  userType?: number;
  targetUserNo?: number;
  noticeType?: number;
}

export interface UserValidation {
  userNo: number;
  chatRoomNo: number;
  isUserNeeded: boolean;
  target: string;
}
