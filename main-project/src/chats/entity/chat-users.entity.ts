import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatList } from './chat-list.entity';

@Entity('chat_users')
export class ChatUsers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => ChatList, (chatRoom) => chatRoom.chatUserNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;

  @ManyToOne((type) => Users, (user) => user.chatUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;
}
