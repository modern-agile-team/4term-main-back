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
  guestTeams: GuestTeam<number[]>[];
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

export interface GuestTeam<T> {
  no?: number;
  boardNo?: number;
  title: string;
  description: string;
  createdDate?: Date;
  guests?: T;
  isAccepted?: T;
}

export interface GuestTeamMetaData {
  guestTeam: GuestTeam<number[]>;
  guestHead: Guest<number>;
  // guestMembers:
}
