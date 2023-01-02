export interface FriendRequestValidation {
  userNo?: number;
  receiverNo?: number;
  senderNo?: number;
  friendNo?: number;
  isFriend?: boolean;
}
export interface FriendRequestStatus {
  isAccept?: boolean;
}
export interface Friend {
  no?: number;
  userNo?: number;
  friendNo?: number;
  receiverNo?: number;
  senderNo?: number;
}

export interface FriendRequestResponse {
  affectedRows: number;
  insertId?: number;
}

export interface FriendToSearch {
  userNo: number;
  nickname: string;
}

export interface FriendInfo {
  friendNo: number;
  nickname: string;
}

export interface NoticeFriend {
  receiverNo?: number;
  userNo?: number;
  friendNo?: number;
}

export interface NoticeUser {
  noticeNo: number;
  userNo: number;
}
