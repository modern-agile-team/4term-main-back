import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('friends')
export class Friends extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column('tinyint', { name: 'is_accept', default: 0 })
  isAccept: number;

  @ManyToOne((type) => Users, (user) => user.friendReceiverNo)
  @JoinColumn({ name: 'receiver_no' })
  receiverNo: number;

  @ManyToOne((type) => Users, (user) => user.friendSenderNo)
  @JoinColumn({ name: 'sender_no' })
  senderNo: number;
}
