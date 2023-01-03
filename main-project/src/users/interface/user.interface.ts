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

export interface ProfileDetail {
  userNo: number;
  nickname: string;
  gender: boolean;
  description?: string;
  major: string;
}
