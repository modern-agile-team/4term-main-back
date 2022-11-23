import { Friends } from 'src/friends/entity/friend.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notices } from './notices.entity';

@Entity('notice_friends')
export class NoticeFriends extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne(() => Friends, (friends) => friends.noticeFriends, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'friend_no' })
  friendNo: number;

  @OneToOne((type) => Notices, (notices) => notices.noticeFriends, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
