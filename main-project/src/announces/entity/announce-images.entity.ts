import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announces } from './announce.entity';

@Entity('announces_images')
export class AnnouncesImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'img_url' })
  imgUrl: string;

  @OneToOne((type) => Announces, (announces) => announces.announcesImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announces_no' })
  announcesNo: number;
}
