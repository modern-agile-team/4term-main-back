import { IntersectionType, OmitType } from '@nestjs/swagger';
import { UserProfile } from 'src/users/entity/user-profile.entity';
import { ParticipationDto } from '../dto/participation.dto';
import { Boards } from '../entity/board.entity';

export interface CreateResponse {
  affectedRows: number;
  insertId?: number;
}
export class Board {
  no: number;
  hostUserNo: number;
  hostNickname: string;
  title: string;
  description: string;
  location: string;
  meetingTime: Date;
  isDone: boolean;
  recruitMale: number;
  recruitFemale: number;
  isImpromptu: boolean;
  hostMembers: string;
  hostMembersNickname: string;
}

export class Participation extends OmitType(ParticipationDto, ['guests']) {
  boardNo: number;
}
