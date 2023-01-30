import { OmitType } from '@nestjs/swagger';
import { CreateGuestTeamDto } from '../dto/create-guest-team.dto';

export class JsonBoard {
  no?: number;
  hostUserNo?: number;
  hostNickname?: string;
  title: string;
  description: string;
  location: string;
  meetingTime: Date;
  isDone: boolean;
  recruitMale: number;
  recruitFemale: number;
  isImpromptu: boolean;
  hostMemberNums?: string;
  hostMemberNicknames?: string;
}

export class Board extends OmitType(JsonBoard, [
  'hostMemberNums',
  'hostMemberNicknames',
]) {
  hostMemberNums?: number[];
  hostMemberNicknames?: number[];
  createdDate?: Date;
}

export class GuestTeam extends OmitType(CreateGuestTeamDto, ['guests']) {
  boardNo: number;
}

export interface Guest {
  no?: number;
  teamNo: number;
  userNo: number;
}
