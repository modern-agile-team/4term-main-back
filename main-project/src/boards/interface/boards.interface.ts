import { IntersectionType } from "@nestjs/swagger";
import { UserProfile } from "src/users/entity/user-profile.entity";
import { Boards } from "../entity/board.entity";

export interface CreateResponse {
  affectedRows: number;
  insertId?: number;
}
export class BoardIF extends Boards {
  nickname: string;
  hostUserNums: string
  hostNicknames: string
}