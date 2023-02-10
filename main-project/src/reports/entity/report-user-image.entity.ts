import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportUsers } from './report-user.entity';

@Entity('report _user_images')
export class ReportUserImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne(
    (type) => ReportUsers,
    (reportUsers) => reportUsers.reportUserImage,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'report_user_no' })
  reportUserNo: number;
}
