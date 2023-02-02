import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announces } from './announce.entity';

@Entity('announces_images')
export class AnnouncesImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne((type) => Announces, (announces) => announces.announcesImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announce_no' })
  announceNo: number;
}
