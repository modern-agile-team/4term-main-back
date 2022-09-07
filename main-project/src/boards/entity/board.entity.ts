import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardBookmark } from './board-bookmark.entity';
import { BoardMemberInfo } from './board-member-info.entity';

// fk없음, entity취합 후 생성예정
@Entity('boards')
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    comment: '인원 모집 여부',
    nullable: false,
  })
  isDone: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'date', nullable: true })
  meetingTime: Date;

  @CreateDateColumn({ nullable: false })
  createdDate: Date;

  @UpdateDateColumn({ nullable: false })
  updatedDate: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date;

  @OneToOne(
    (type) => BoardMemberInfo,
    (boardMemberInfo) => boardMemberInfo.boardNo,
  )
  boardMemberaInfo: BoardMemberInfo;

  @OneToOne((type) => BoardBookmark, (boardBookmark) => boardBookmark.boardNo)
  boardBookmark: BoardBookmark;
}
