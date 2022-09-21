import { Users } from 'src/users/entity/user.entity';

export interface NoticeResponse {
  affectedRows: number;
  insertId?: number;
}

export interface NoticeDetail {
  userNo: number | Users;
  targetUserNo: number | Users;
  type: number;
  value: string;
}
