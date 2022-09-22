export interface BoardResponse {
  affectedRows: number;
  insertId?: number;
}

export interface BoardMemberDetail {
  boardNo: number;
  male: number;
  female: number;
}

export interface BookmarkDetail {
  boardNo: number;
  userNo: number;
}
