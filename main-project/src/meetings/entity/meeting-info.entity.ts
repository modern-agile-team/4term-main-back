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
  host: number;

  @Column({ default: null })
  guest: number;

  @OneToOne((type) => Meeting, (meeting) => meeting.meetingInfo, {
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meeting;
}
