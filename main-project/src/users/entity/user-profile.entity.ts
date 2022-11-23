<<<<<<< HEAD
import { Manners } from 'src/manners/entity/manners.entity';
=======
import { MannersTemperature } from 'src/manners/entity/manner-Temperatures.entity';
>>>>>>> 7080587f7cbbd4b54e71a7817e08c42c3444bd79
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
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToOne((type) => Manners, (Manners) => Manners.userProfileNo)
  mannerNo: Manners;

  @ManyToOne((type) => University, (university) => university.usersUniversity)
  @JoinColumn({ name: 'university_no' })
  universityNo: number;

  @ManyToOne((type) => Majors, (majors) => majors.userProfile, {
    nullable: false,
  })
  @JoinColumn({ name: 'major_no' })
  majorNo: number;

  @OneToOne((type) => ProfileImages, (profileImages) => profileImages.userNo)
  profileImages: ProfileImages;

  @OneToOne((type) => MannersTemperature, (manners) => manners.userProfile)
  mannerTemperature: MannersTemperature;
}
