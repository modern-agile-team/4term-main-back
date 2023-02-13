import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity('profile_images')
export class ProfileImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.profileImage, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_no' })
  userProfileNo: number;
}
