import { Boards } from 'src/boards/entity/board.entity';
import { NoticeChats } from 'src/notices/entity/notice-chat.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ChatLog } from './chat-log.entity';
import { ChatUsers } from './chat-users.entity';

@Entity('chat_list')
export class ChatList extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'room_name', type: 'varchar', length: 255, nullable: false })
  roomName: string;

  @ManyToOne((type) => Boards, (boards) => boards.chatBoard)
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToMany((type) => ChatUsers, (chatUsers) => chatUsers.chatRoomNo)
  chatUserNo: ChatUsers[];

  @OneToMany((type) => ChatLog, (chatLog) => chatLog.chatRoomNo)
  chatLogNo: ChatLog[];

  @OneToMany((type) => NoticeChats, (noticeChats) => noticeChats.chatRoomNo)
  noticeChat: NoticeChats[];

  @OneToOne(() => Meetings, (meeting) => meeting.chatRoomNo)
  meetingNo: number;
}
