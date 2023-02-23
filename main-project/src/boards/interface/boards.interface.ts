export class Board<T> {
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
  hostMemberNums?: T;
  hostMemberNicknames?: T;
  createdDate?: Date;
}

export class BoardPagenation {
  boards: Board<string[]>[];
  totalPage: number;
  page: number;
}

export class GuestTeamPagenation {
  guestTeams: GuestTeam<number[]>[];
  totalPage: number;
  page: number;
}

export interface Guest<T> {
  no?: number;
  teamNo: number;
  userNo: number;
  isAnswered?: boolean;
  isAccepted?: T;
}

export interface Host<T> {
  users?: T;
  acceptedResults?: T;
  userNo?: number;
  boardNo?: number;
  isAccepted?: boolean;
  isAnswered?: boolean;
}

export interface GuestTeam<T> {
  no?: number;
  boardNo?: number;
  title: string;
  description: string;
  guests?: T;
  isAccepted?: T;
}
