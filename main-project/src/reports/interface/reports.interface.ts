import { OmitType } from "@nestjs/swagger";
import { Reports } from "../entity/reports.entity";

export interface ReportDetail {
  reportNo: number;
  targetBoardNo?: number;
  targetUserNo?: number;
}

export interface ReportIF {
  no: number;
  title: string;
  description: string;
  userNo: number;
  targetBoardNo?: number;
  targetUserNo?: number;
}
