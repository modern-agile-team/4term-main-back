import { BaseParameterObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { BoardBookmarks } from 'src/boards/entity/board-bookmark.entity';
import { BoardMemberInfos } from 'src/boards/entity/board-member-info.entity';
import { Boards } from 'src/boards/entity/board.entity';
import { Friends } from 'src/friends/entities/friend.entity';
import { MeetingInfo } from 'src/meetings/entity/meeting-info.entity';
import { Meetings } from 'src/meetings/entity/meeting.entity';
import { GuestMembers } from 'src/members/entity/guest-members.entity';
import { HostMembers } from 'src/members/entity/host-members.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import { Users } from 'src/users/entity/user.entity';

export const entities = [
  Boards,
  BoardBookmarks,
  BoardMemberInfos,
  Friends,
  MeetingInfo,
  Meetings,
  GuestMembers,
  HostMembers,
  Notices,
  Users,
];
