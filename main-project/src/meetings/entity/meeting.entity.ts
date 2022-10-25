import { Boards } from 'src/boards/entity/board.entity';
import { ChatList } from 'src/chats/entity/chat-list.entity';
import { GuestMembers } from 'src/members/entity/guest-members.entity';
import { HostMembers } from 'src/members/entity/host-members.entity';
import { NoticeMeetings } from 'src/notices/entity/notice-meeting.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingInfo } from './meeting-info.entity';

@Entity('meetings')
export class Meetings extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column('varchar', { length: 255 })
  location: string;

  @Column({ type: 'datetime' })
  time: Date;

  @Column({ type: 'tinyint', width: 1, default: false, name: 'is_accepted' })
  isAccepted: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne((type) => MeetingInfo, (meetingInfo) => meetingInfo.meetingNo)
  meetingInfo: MeetingInfo;

  @OneToMany((type) => HostMembers, (hostMembers) => hostMembers.meetingNo)
  hostMembers: HostMembers[];

  @OneToMany((type) => GuestMembers, (guestMembers) => guestMembers.meetingNo)
  guestMembers: GuestMembers[];

  @OneToOne((type) => Boards, (board) => board.meetingNo)
  board: Boards;

  @OneToMany((type) => ChatList, (chat) => chat.meetingNo)
  chatMeetingNo: ChatList;

  @OneToMany(
    (type) => NoticeMeetings,
    (noticeMeetings) => noticeMeetings.meetingNo,
  )
  noticeMeetingNo: NoticeMeetings;
}
