export interface UsersDetail {
  gender: boolean;
  nickname: string;
  email: string;
}

export interface UserCreateResponse {
  affectedRows: number;
  insertId?: number;
}
