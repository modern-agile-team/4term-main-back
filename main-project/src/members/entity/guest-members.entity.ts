import { Meeting } from 'src/meetings/entity/meeting.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('guest_members')
export class GuestMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Meeting, (meeting) => meeting.guestMembers)
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meeting;
}
