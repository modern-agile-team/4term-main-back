import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'tinyint', nullable: true })
  gender: number;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column({ type: 'tinyint' })
  admin: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @CreateDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;
}
