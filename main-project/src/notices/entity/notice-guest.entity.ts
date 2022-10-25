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
export class NoticeGuests extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.noticeGuests)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Notices, (notices) => notices.noticeMeetings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
