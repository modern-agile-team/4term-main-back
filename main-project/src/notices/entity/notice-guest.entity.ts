import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notices } from './notices.entity';

@Entity('notice_guests')
export class NoticeGuest extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.noticeGuests)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Notices, (notices) => notices.noticeMeetings)
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
