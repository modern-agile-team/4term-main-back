import { Users } from 'src/users/entity/user.entity';

export interface NoticeResponse {
  affectedRows: number;
  insertId?: number;
}

export interface NoticeDetail {
  userNo: number;
  targetUserNo: number | Users;
  type: number;
  value: string;
}
