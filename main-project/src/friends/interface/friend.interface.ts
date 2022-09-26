import { Users } from 'src/users/entity/user.entity';

export interface FriendDetail {
  userNo: number;
  friendNo: number;
}
export interface FriendRequestDetail {
  requestUserNo: number;
  acceptUserNo: number;
}
