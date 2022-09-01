import { Meeting } from 'src/meetings/entity/meeting.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('host_members')
export class HostMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'user_no' })
  userNo: number;

  @OneToOne((type) => Meeting, (meeting) => meeting.hostMembers, {
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meeting;
}
