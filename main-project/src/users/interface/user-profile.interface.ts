export interface UsersDetail {
  gender: boolean;
  nickname: string;
  email: string;
}

export interface UserCreateResponse {
  affectedRows: number;
  insertId?: number;
}

export interface UpdateUserInfo {
  gender: boolean;
  nickname: string;
  email: string;
  // description: string;
}

export interface UpdateUsersDetail {
  description?: string;
}
