export interface FriendDetail {
  receiverNo?: number;
  senderNo?: number;
  friendNo?: number;
}
export interface FriendRequestStatus {
  isAccept?: number;
}
export interface Friend {
  no?: number;
  userNo?: number;
  friendNo?: number;
}
export interface FriendList {
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
  noticeNo?: number;
  senderNo?: number;
  receiverNo?: number;
  friendNo?: number;
}
export interface NoticeUser {
  noticeNo: number;
  userNo: number;
}

export interface FriendNo {
  friendNo: number;
}
