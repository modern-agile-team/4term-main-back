import { Meetings } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chat_list')
export class ChatList extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'room_name', type: 'varchar', length: 255, nullable: false })
  roomName: string;

  @ManyToOne((type) => Users, (user) => user.chatUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Meetings, (meeting) => meeting.chatMeetingNo)
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: number;
}
