export interface UserProfileDetail {
  no: number;
  description?: string;
  majorNo: number;
  universityNo: number;
  nickname: string;
}

export interface User {
  email: string;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export enum OAuthAgency {
  kakao,
  google,
}

export interface UserPayload {
  userNo: number;
  email: string;
  gender: boolean;
  nickname: string;
  isAdmin: boolean;
  profileImage: string;
  issuer?: string;
  expiration?: number;
  iat?: any;
  exp?: any;
}
