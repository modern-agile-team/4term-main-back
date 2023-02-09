import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ReportBoards } from '../entity/report-board.entity';

@EntityRepository(ReportBoards)
export class ReportBoardRepository extends Repository<ReportBoards> {
  async getReportBoard(reportNo: number): Promise<ReportBoards> {
    try {
      const reportBoard: ReportBoards = await this.createQueryBuilder()
        .select()
        .where('report_no = :reportNo', { reportNo })
        .getOne();

      return reportBoard;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReportBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createBoardReport(
    reportNo: number,
    boardNo: number,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportBoards)
        .values({ reportNo, targetBoardNo: boardNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoardReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
