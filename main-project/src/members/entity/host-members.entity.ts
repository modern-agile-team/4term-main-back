import { Meeting } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('host_members')
export class HostMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.hostMembers)
  @JoinColumn({ name: 'user_no' })
  userNo: Users;

  @ManyToOne((type) => Meeting, (meeting) => meeting.hostMembers)
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meeting;
}
