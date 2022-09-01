import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';

@Entity('meeting_info')
export class MeetingInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  host_no: number;

  @Column()
  guest_no: number;

  @OneToOne((type) => Meeting, (meeting) => meeting.meeting_info)
  @JoinColumn({ name: 'meeting_no' })
  meeting: Meeting;
}
