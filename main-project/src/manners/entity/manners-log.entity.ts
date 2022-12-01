import { LargeNumberLike } from 'crypto';
import { ChatList } from 'src/chats/entity/chat-list.entity';
import { ChatUsers } from 'src/chats/entity/chat-users.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Manners } from './manners.entity';

@Entity('manner_log')
export class MannerLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'is_checked' })
  isChecked: number;

  @ManyToOne((type) => ChatList, (chatList) => chatList.mannerLogNo)
  @JoinColumn({ name: 'chat_list_no' })
  chatListNo: number;

  @ManyToOne((type) => ChatUsers, (chatUserNo) => chatUserNo.mannerUserNo)
  @JoinColumn({ name: 'chat_user_no' })
  chatUserNo: number;

  @ManyToOne((type) => ChatUsers, (chatUserNo) => chatUserNo.mannerTargetUserNo)
  @JoinColumn({ name: 'chat_target_user_no' })
  chatTargetUserNo: number;

  @Column({ name: 'grade' })
  giveGrade: number;
}
