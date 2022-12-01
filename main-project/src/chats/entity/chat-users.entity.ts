import { MannerLog } from 'src/manners/entity/manners-log.entity';
import { Manners } from 'src/manners/entity/manners.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatList } from './chat-list.entity';

@Entity('chat_users')
export class ChatUsers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'user_type', nullable: false })
  userType: number;

  @ManyToOne((type) => ChatList, (chatRoom) => chatRoom.chatUserNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;

  @ManyToOne((type) => Users, (user) => user.chatUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToMany((type) => MannerLog, (mannerLog) => mannerLog.chatUserNo)
  @JoinColumn({ name: 'manner_log_no' })
  mannerUserNo: number;

  @OneToMany((type) => MannerLog, (mannerLog) => mannerLog.chatTargetUserNo)
  @JoinColumn({ name: 'manner_log_no' })
  mannerTargetUserNo: number;

  @OneToMany((type) => Manners, (manners) => manners.userNo)
  mannerNo: Manners;
}
