import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('friends')
export class Friends extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.friendMyNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Users, (user) => user.friendNo)
  @JoinColumn({ name: 'friend_no' })
  friendNo: number;
}
