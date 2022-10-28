import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatList } from './chat-list.entity';

@Entity('chat_log')
export class ChatLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => ChatList, (chatList) => chatList.chatLogNo)
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;

  @ManyToOne((type) => Users, (users) => users.chatLogUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column()
  message: string;

  @CreateDateColumn({ name: 'sended_time' })
  sendedTime: Date;
}
