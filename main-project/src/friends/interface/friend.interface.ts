export interface FriendDetail {
  receiverNo: number;
  senderNo: number;
}
export interface FriendRequest {
  no: number;
  isAccept: number;
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
