import { Manners } from 'src/manners/entity/manners.entity';
import { Majors } from 'src/universities/entity/majors.entity';
import { University } from 'src/universities/entity/university.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileImages } from './profile-images.entity';
import { Users } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Users, (users) => users.userProfileNo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column({ default: false })
  gender: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToOne((type) => Manners, (Manners) => Manners.userProfileNo)
  mannerNo: Manners;

  @ManyToOne((type) => University, (university) => university.userProfile)
  @JoinColumn({ name: 'university_no' })
  universityNo: number;

  @ManyToOne((type) => Majors, (majors) => majors.userProfile, {
    nullable: false,
  })
  @JoinColumn({ name: 'major_no' })
  majorNo: number;

  @OneToOne(
    (type) => ProfileImages,
    (profileImages) => profileImages.userProfileNo,
  )
  profileImage: ProfileImages;
}
