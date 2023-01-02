export interface MannerChatUserInfo {
  chatRoomNo: number;
  userNo: number;
}

export interface ChatRoomNo {
  chatRoomNo: number;
}

export interface UserType {
  userType: number;
}

export interface UserNo {
  userNo: string;
}

export interface UserGrade {
  grade: number;
}
export interface UserInfo {
  userType: number;
  userNo: number;
}

export interface Manner {
  chatUserNo: number;
  chatRoomNo: number;
  chatTargetUserNo: number;
  grade: number;
}
