import { ChatList } from 'src/chats/entity/chat-list.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne((type) => Notices, (notices) => notices.noticeChats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
