import { Boards } from 'src/boards/entity/board.entity';
import { ChatList } from 'src/chats/entity/chat-list.entity';
import { ChatUsers } from 'src/chats/entity/chat-users.entity';
import { UserProfile } from 'src/users/entity/user-profile.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('manners')
export class Manners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  grade: number;

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.mannerNo, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_no' })
  userProfileNo: number;
}
