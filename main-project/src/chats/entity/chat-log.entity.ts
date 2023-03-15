import { type } from 'os';
import { Meetings } from 'src/meetings/entity/meeting.entity';
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
import { ChatFileUrls } from './chat-file-urls.entity';
import { ChatList } from './chat-list.entity';

@Entity('chat_log')
export class ChatLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => ChatList, (chatList) => chatList.chatLogNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;

  @ManyToOne((type) => Users, (users) => users.chatLogUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToOne(() => Meetings, (meetings) => meetings.chatLogNo, {
    nullable: true,
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: number;

  @Column({ nullable: true })
  message: string;

  @CreateDateColumn({ name: 'sended_time' })
  sendedTime: Date;

  @OneToMany((type) => ChatFileUrls, (chatFileUrls) => chatFileUrls.chatLogNo)
  chatFileUrl: ChatFileUrls[];
}
