import { ChatList } from 'src/chats/entity/chat-list.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notices } from './notices.entity';

@Entity('notice_chats')
export class NoticeChats extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => ChatList, (chatList) => chatList.noticeChat, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;

  @OneToOne((type) => Notices, (notices) => notices.noticeChats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
