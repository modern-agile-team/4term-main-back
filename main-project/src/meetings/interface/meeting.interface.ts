export interface InsertRaw {
  affectedRows: number;
  insertId?: number;
}

export interface Meeting {
  chatRoomNo?: number;
  location: string;
  time: Date;
}

export interface MeetingHosts {
  hosts: any;
}

export interface MeetingGuests {
  guests: any;
}

export interface MeetingMembers {
  members: any;
}

export interface MeetingUser {
  meetingNo: number;
  userNo: number;
}

export interface UpdatedMeeting {
  location?: string;
  time?: Date;
  isAccepted?: boolean;
}
