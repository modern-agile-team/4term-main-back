import { Meetings } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ChatLog } from './chat-log.entity';
import { ChatUsers } from './chat-users.entity';

@Entity('chat_list')
export class ChatList extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'room_name', type: 'varchar', length: 255, nullable: false })
  roomName: string;

  @ManyToOne((type) => Meetings, (meeting) => meeting.chatMeetingNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: number;

  @OneToMany((type) => ChatUsers, (chatUsers) => chatUsers.chatRoomNo)
  chatUserNo: ChatUsers[];

  @OneToMany((type) => ChatLog, (chatLog) => chatLog.chatRoomNo)
  chatLogNo: ChatLog[];
}
