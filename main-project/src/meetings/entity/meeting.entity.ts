import { GuestMembers } from 'src/members/entity/guest-members.entity';
import { HostMembers } from 'src/members/entity/host-members.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingInfo } from './meeting-info.entity';

@Entity('meetings')
export class Meetings extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column('varchar', { length: 255 })
  location: string;

  @Column({ type: 'datetime' })
  time: Date;

  @Column({ type: 'tinyint', width: 1, default: false, name: 'is_accepted' })
  isAccepted: boolean;

  //   @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  //   created_date: string;

  @CreateDateColumn()
  created_date: Date;

  //   @Column({
  //     type: 'datetime',
  //     onUpdate: 'CURRENT_TIMESTAMP',
  //   })
  //   updated_date: string;

  @UpdateDateColumn({ default: null, nullable: true, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne((type) => MeetingInfo, (meetingInfo) => meetingInfo.meetingNo)
  meetingInfo: MeetingInfo;

  @OneToMany((type) => HostMembers, (hostMembers) => hostMembers.meetingNo)
  hostMembers: HostMembers[];

  @OneToMany((type) => GuestMembers, (guestMembers) => guestMembers.meetingNo)
  guestMembers: GuestMembers[];
}
