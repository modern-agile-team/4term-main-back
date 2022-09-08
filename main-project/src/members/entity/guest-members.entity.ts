import { Meetings } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('guest_members')
export class GuestMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.guestMembers)
  @JoinColumn({ name: 'user_no' })
  userNo: Users;

  @ManyToOne((type) => Meetings, (meeting) => meeting.guestMembers)
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meetings;
}
