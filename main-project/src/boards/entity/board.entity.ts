import { BoardBookmarks } from './board-bookmark.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from 'src/users/entity/user.entity';
import { ReportBoards } from 'src/reports/entity/report-board.entity';
import { NoticeBoards } from 'src/notices/entity/notice-board.entity';
import { BoardHosts } from './board-host.entity';
import { BoardGuests } from './board-guest.entity';
import { ChatList } from 'src/chats/entity/chat-list.entity';

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
    nullable: true,
  })
  isDone: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'datetime', name: 'meeting_time', nullable: true })
  meetingTime: Date;

  @Column({ type: 'int', nullable: false })
  male: number;

  @Column({ type: 'int', nullable: false })
  female: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ default: null, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne((type) => BoardBookmarks, (boardBookmark) => boardBookmark.boardNo)
  boardBookmark: BoardBookmarks;

  @ManyToOne((type) => Users, (user) => user.board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToMany((type) => NoticeBoards, (noticeBoards) => noticeBoards.boardNo)
  @JoinColumn()
  noticeBoard: NoticeBoards;

  @OneToMany((type) => BoardHosts, (boardHosts) => boardHosts.boardNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  hosts: BoardHosts;

  @OneToMany((type) => BoardGuests, (boardGuests) => boardGuests.boardNo)
  guests: BoardGuests;

  @OneToMany((type) => ReportBoards, (boardReport) => boardReport.targetBoardNo)
  boardReport: ReportBoards[];

  @OneToMany((type) => ChatList, (chat) => chat.boardNo)
  chatBoard: ChatList[];
}
