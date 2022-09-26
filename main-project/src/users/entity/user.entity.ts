import { BoardBookmarks } from 'src/boards/entity/board-bookmark.entity';
import { Boards } from 'src/boards/entity/board.entity';
import { FriendReqList } from 'src/friends/entity/friend-req-list.entity';
import { Friends } from 'src/friends/entity/friend.entity';
import { MeetingInfo } from 'src/meetings/entity/meeting-info.entity';
import { GuestMembers } from 'src/members/entity/guest-members.entity';
import { HostMembers } from 'src/members/entity/host-members.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import { ReportedUsers } from 'src/reports/entity/reported-user.entity';
import { Reports } from 'src/reports/entity/reports.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfile } from './user-images.entity';
import { UserManners } from './user-manners.entity';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column()
  gender: boolean;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column()
  admin: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @CreateDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;

  @OneToMany((type) => GuestMembers, (guestMembers) => guestMembers.userNo)
  guestMembers: GuestMembers[];

  @OneToMany((type) => HostMembers, (hostMembers) => hostMembers.userNo)
  hostMembers: HostMembers[];

  @OneToMany((type) => MeetingInfo, (meetingInfo) => meetingInfo.guest)
  meetingGuest: MeetingInfo[];

  @OneToMany((type) => MeetingInfo, (meetingInfo) => meetingInfo.host)
  meetingHost: MeetingInfo[];

  @OneToMany((type) => BoardBookmarks, (boardBookmark) => boardBookmark.userNo)
  boardBookmark: BoardBookmarks;

  @OneToMany((type) => Boards, (board) => board.userNo)
  board: Boards[];

  @OneToMany((type) => Reports, (report) => report.userNo)
  report: Reports[];

  @OneToMany(
    (type) => ReportedUsers,
    (reportedUsers) => reportedUsers.targetUserNo,
  )
  reportedUser: ReportedUsers[];

  @OneToMany((type) => Notices, (notices) => notices.userNo)
  noticeUser: Notices[];

  @OneToMany((type) => Notices, (notices) => notices.targetUserNo)
  noticeTargetUser: Notices[];

  @OneToOne((type) => UserManners, (userManners) => userManners.userNo)
  mannerUserNo: UserManners;

  @OneToMany((type) => Friends, (friends) => friends.userNo)
  friendMyNo: Friends[];

  @OneToMany((type) => Friends, (friends) => friends.friendNo)
  friendNo: Friends[];

  @OneToMany(
    (type) => FriendReqList,
    (friendReqList) => friendReqList.requestUserNo,
  )
  friendRequestUser: FriendReqList[];

  @OneToMany(
    (type) => FriendReqList,
    (friendReqList) => friendReqList.acceptUserNo,
  )
  friendAcceptUser: FriendReqList[];
  @OneToOne((type) => UserProfile, (userProfile) => userProfile.userNo)
  userProfile: UserProfile;
}
