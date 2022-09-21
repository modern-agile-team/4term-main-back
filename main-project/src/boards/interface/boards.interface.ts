import { Meetings } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import { Boards } from '../entity/board.entity';

export interface BoardResponse {
  affectedRows: number;
  insertId?: number;
}

export interface BoardDetail {
  userNo: Users | number;
  meetingNo: Meetings | number;
  title: string;
  location?: string;
  description?: string;
  meetingTime?: Date;
  //   isDone?: boolean;
}

export interface BoardMemberDetail {
  boardNo: Boards | number;
  male: number;
  female: number;
}
