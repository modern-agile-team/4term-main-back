import { Meeting } from 'src/meetings/entity/meeting.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('host_members')
export class HostMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Meeting, (meeting) => meeting.hostMembers)
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meeting;
}
