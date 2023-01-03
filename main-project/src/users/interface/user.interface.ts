export interface User {
  userNo: number;
  status: number;
  accessToken?: string;
}

export interface Profile {
  userNo: number;
  gender: boolean;
  nickname: string;
  profileImage: string;
}
