export interface FriendRequestValidation {
  userNo?: number;
  receiverNo?: number;
  senderNo?: number;
  friendNo?: number;
  friendReqStatus?: boolean;
}
export interface FriendRequestStatus {
  isAccept?: boolean;
  friendNo?: number;
}
export interface Friend {
  no?: number;
  userNo?: number;
  friendNo?: number;
  friendUserNo?: number;
  receiverNo?: number;
  senderNo?: number;
}

export interface FriendInsertResult {
  affectedRows?: number;
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
  receiverNo?: number;
  senderNo?: number;
  friendNo?: number;
}

export interface NoticeUser {
  noticeNo: number;
  userNo: number;
}
