export class Board<T, U, X> {
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
  hostMembers: X;
  createdDate?: Date;
}

export class BoardPagenation {
  boards: Board<number[], string[], HostProfile>[];
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
  isAccepted?: T;
}

export class GuestProfile {
  no: number;
  nicknmae: string;
  profileImage: string;
}

export interface HostProfile extends GuestProfile {}
