import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// fk없음, entity취합 후 생성예정
@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    comment: '인원 모집 여부',
  })
  done: boolean;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'date' })
  time: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn({ nullable: true })
  updated_date: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_date: Date;
}
