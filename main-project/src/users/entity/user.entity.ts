import { BoardBookmarks } from 'src/boards/entity/board-bookmark.entity';
import { BoardGuests } from 'src/boards/entity/board-guest.entity';
import { BoardHosts } from 'src/boards/entity/board-host.entity';
import { Boards } from 'src/boards/entity/board.entity';
import { ChatLog } from 'src/chats/entity/chat-log.entity';
import { ChatUsers } from 'src/chats/entity/chat-users.entity';
import { Enquiries } from 'src/enquiries/entity/enquiry.entity';
import { Friends } from 'src/friends/entity/friend.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import { Reports } from 'src/reports/entity/reports.entity';
import { ReportUser } from 'src/reports/entity/user-reports.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ default: false })
  gender: boolean;

  @Column({ type: 'tinyint', width: 1, default: false })
  isAdmin: boolean;

  @Column({ type: 'int', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @DeleteDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;

  @OneToMany((type) => BoardGuests, (boardGuests) => boardGuests.userNo)
  guestMembers: BoardGuests[];

  @OneToMany((type) => BoardHosts, (boardHosts) => boardHosts.userNo)
  hostMembers: BoardHosts[];

  @OneToMany((type) => BoardBookmarks, (boardBookmark) => boardBookmark.userNo)
  boardBookmark: BoardBookmarks;

  @OneToMany((type) => Boards, (board) => board.userNo)
  board: Boards[];

  @OneToMany((type) => Reports, (report) => report.userNo)
  report: Reports[];

  @OneToMany((type) => ReportUser, (reportUser) => reportUser.targetUserNo)
  reportUser: ReportUser[];

  @OneToMany((type) => Notices, (notices) => notices.userNo)
  noticeUser: Notices[];

  @OneToMany((type) => Notices, (notices) => notices.targetUserNo)
  noticeTargetUser: Notices[];

  @OneToMany((type) => Friends, (friends) => friends.receiverNo)
  friendReceiverNo: Friends[];

  @OneToMany((type) => Friends, (friends) => friends.senderNo)
  friendSenderNo: Friends[];

  @OneToMany((type) => Enquiries, (enquiries) => enquiries.userNo)
  enquiry: Enquiries[];

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.userNo)
  userProfileNo: UserProfile;

  @OneToMany((type) => ChatUsers, (chatUsers) => chatUsers.userNo)
  chatUserNo: ChatUsers[];

  @OneToMany(
    (type) => BoardHosts,
    (boardHostMembers) => boardHostMembers.userNo,
  )
  hostMember: BoardHosts;

  @OneToMany(
    (type) => BoardGuests,
    (boardHostMembers) => boardHostMembers.userNo,
  )
  guestMember: BoardGuests;

  @OneToMany((type) => ChatLog, (chatLog) => chatLog.userNo)
  chatLogUserNo: ChatLog[];
}
