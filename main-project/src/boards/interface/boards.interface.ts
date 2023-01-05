import { IntersectionType, OmitType } from '@nestjs/swagger';
import { UserProfile } from 'src/users/entity/user-profile.entity';
import { ParticipationDto } from '../dto/participation.dto';
import { Boards } from '../entity/board.entity';

export interface CreateResponse {
  affectedRows: number;
  insertId?: number;
}
export class Board extends Boards {
  nickname: string;
  hostUserNums: string;
  hostNicknames: string;
}

export class Participation extends OmitType(ParticipationDto, ['guests']) {
  boardNo: number;
}
