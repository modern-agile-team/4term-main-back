export interface UserAuth {
  userNo: number;
  password: string;
}

export interface Payload {
  userNo: number;
  nickname: string;
  profileImage: string;
  iat?: any;
  exp?: any;
}
