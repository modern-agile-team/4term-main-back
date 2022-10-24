import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeGuest } from './notice-guest.entity';
import { NoticeMeeting } from './notice-meeting.entity';

@Entity('notices')
export class Notices extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.noticeUser)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Users, (user) => user.noticeTargetUser, {
    nullable: true,
  })
  @JoinColumn({ name: 'target_user_no' })
  targetUserNo: number;

  @Column()
  type: number;

  @Column({ name: 'read_datetime', nullable: true })
  readDatetime: Date;

  @CreateDateColumn({
    name: 'created_date',
  })
  createdDate: Date;

  @Column('varchar', { length: 100, nullable: true })
  value: string;

  @OneToOne(
    (type) => NoticeMeeting,
    (noticeMeetings) => noticeMeetings.noticeNo,
    { onDelete: 'CASCADE' },
  )
  noticeMeetings: NoticeMeeting;

  @OneToMany((type) => NoticeGuest, (noticeGuests) => noticeGuests.noticeNo)
  noticeGuests: NoticeGuest[];
}
