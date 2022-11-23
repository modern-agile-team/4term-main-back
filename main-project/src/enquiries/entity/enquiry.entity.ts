import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnquiryImages } from './enquiry-images.entity';

@Entity('enquiries')
export class Enquiries extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ default: null, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deletedDate: Date;

  @ManyToOne((type) => Users, (user) => user.enquiry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToOne((type) => EnquiryImages, (enquiryImages) => enquiryImages.enquiryNo)
  @JoinColumn({ name: 'enquiry_images' })
  enquiryImages: EnquiryImages;
}
