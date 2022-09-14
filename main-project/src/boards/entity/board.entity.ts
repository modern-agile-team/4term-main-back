import { Meetings } from 'src/meetings/entity/meeting.entity';
import { BoardBookmarks } from './board-bookmark.entity';
import { BoardMemberInfos } from './board-member-info.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('boards')
export class Boards extends BaseEntity {
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

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ default: null, nullable: false, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne(
    (type) => BoardMemberInfos,
    (boardMemberInfo) => boardMemberInfo.boardNo,
  )
  boardMemberInfo: BoardMemberInfos;

  @OneToOne((type) => BoardBookmarks, (boardBookmark) => boardBookmark.boardNo)
  boardBookmark: BoardBookmarks;

  @OneToOne((type) => Meetings, (meeting) => meeting.board)
  @JoinColumn({ name: 'board_no' })
  meetingNo: Meetings;
}
