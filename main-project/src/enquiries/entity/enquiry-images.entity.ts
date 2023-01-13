import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enquiries } from './enquiry.entity';

@Entity('enquiry_images')
export class EnquiryImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'img_url' })
  imageUrl: string;

  @OneToOne((type) => Enquiries, (enquiries) => enquiries.enquiryImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enquiry_no' })
  enquiryNo: number;
}
