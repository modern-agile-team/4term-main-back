export class Board<T, U> {
  no?: number;
  hostUserNo?: number;
  hostNickname?: string;
  title: string;
  description: string;
  location: string;
  meetingTime: Date;
  isDone: boolean;
  recruitMale: number;
  recruitFemale: number;
  isImpromptu: boolean;
  bookmark: boolean;
  hostMemberNums?: T;
  hostMemberNicknames?: U;
  createdDate?: Date;
}

export class BoardPagenation {
  boards: Board<number[], string[]>[];
  totalPage: number;
  page: number;
}

export class GuestTeamPagenation {
  guestTeams: GuestTeam<number[], GuestProfile>[];
  acceptedGuestTeamNo: number | null;
  totalPage: number;
  page: number;
}

export interface Guest<T> {
  no?: number;
  teamNo: number;
  userNo: number;
  isAccepted?: T;
}

export interface Host<T> {
  users?: T;
  acceptedResults?: T;
  userNo?: number;
  boardNo?: number;
  isAccepted?: boolean;
}

export interface GuestTeam<T, U> {
  no?: number;
  boardNo?: number;
  title: string;
  description: string;
  createdDate?: Date;
  guests?: U;
  // guestMembers?: GuestProfile | string;
  isAccepted?: T;
}

export interface GuestProfile {
  no: number;
  nicknmae: string;
  profileImage: string;
}
