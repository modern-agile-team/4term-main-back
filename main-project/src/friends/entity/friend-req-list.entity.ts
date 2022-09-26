import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('friend_req_list')
export class FriendReqList extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.friendRequestUser)
  @JoinColumn({ name: 'request_user_no' })
  requestUserNo: number;

  @ManyToOne((type) => Users, (user) => user.friendAcceptUser)
  @JoinColumn({ name: 'accept_user_no' })
  acceptUserNo: number;

  @Column('tinyint', { name: 'is_accept', default: 0 })
  isAccept: boolean;
}
