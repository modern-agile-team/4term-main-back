import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announcements } from './announcement.entity';

@Entity('announcement_images')
export class AnnouncementImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'img_url' })
  imgUrl: string;

  @OneToOne(
    (type) => Announcements,
    (announcements) => announcements.announcementImages,
  )
  @JoinColumn({ name: 'announcement_images' })
  announcementNo: number;
}
