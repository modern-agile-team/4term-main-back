import { BoardBookmarks } from 'src/boards/entity/board-bookmark.entity';
import { MeetingInfo } from 'src/meetings/entity/meeting-info.entity';
import { GuestMembers } from 'src/members/entity/guest-members.entity';
import { HostMembers } from 'src/members/entity/host-members.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column()
  gender: boolean;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column()
  admin: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @CreateDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;

  @OneToMany((type) => GuestMembers, (guestMembers) => guestMembers.userNo)
  guestMembers: GuestMembers[];

  @OneToMany((type) => HostMembers, (hostMembers) => hostMembers.userNo)
  hostMembers: HostMembers[];

  @OneToMany((type) => MeetingInfo, (meetingInfo) => meetingInfo.guest)
  meetingGuest: MeetingInfo[];

  @OneToMany((type) => MeetingInfo, (meetingInfo) => meetingInfo.host)
  meetingHost: MeetingInfo[];

  @OneToMany((type) => BoardBookmarks, (boardBookmark) => boardBookmark.userNo)
  boardBookmark: BoardBookmarks;

  @OneToMany((type) => Notices, (notices) => notices.userNo)
  noticeUser: Notices[];

  @OneToMany((type) => Notices, (notices) => notices.targetUserNo)
  noticeTargetUser: Notices[];
}
