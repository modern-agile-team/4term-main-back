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
import { NoticeBoards } from './notice-board.entity';
import { NoticeGuests } from './notice-guest.entity';
import { NoticeMeetings } from './notice-meeting.entity';

@Entity('notices')
export class Notices extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.noticeUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Users, (user) => user.noticeTargetUser, {
    nullable: true,
    onDelete: 'CASCADE',
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
    (type) => NoticeMeetings,
    (noticeMeetings) => noticeMeetings.noticeNo,
    { onDelete: 'CASCADE' },
  )
  noticeMeetings: NoticeMeetings;

  @OneToMany((type) => NoticeGuests, (noticeGuests) => noticeGuests.noticeNo)
  noticeGuests: NoticeGuests[];

  @OneToMany((type) => NoticeBoards, (noticeBoards) => noticeBoards.noticeNo)
  noticeBoards: NoticeBoards;
}
