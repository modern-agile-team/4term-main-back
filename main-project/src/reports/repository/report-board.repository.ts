import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ReportBoards } from '../entity/report-board.entity';
import { Report, ReportPagenation } from '../interface/reports.interface';

@EntityRepository(ReportBoards)
export class ReportBoardRepository extends Repository<ReportBoards> {
  async getReportBoards(page: number): Promise<ReportPagenation> {
    try {
      const query: SelectQueryBuilder<ReportBoards> = this.createQueryBuilder(
        'reportBoards',
      )
        .leftJoin('reportBoards.reportNo', 'reports')
        .select([
          'reportBoards.no AS no',
          'reportBoards.report_no AS reportNo',
          'reports.user_no AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportBoards.target_board_no AS targetBoardNo',
          'DATE_FORMAT(reports.created_date, "%Y.%m.%d %T") AS createdDate',
        ])
        .limit(5);

      const totalPage: number = Math.ceil((await query.getCount()) / 10);

      if (page > 1) {
        query.offset((page - 1) * 5);
      }

      const reports: Report<string[]>[] = await query.getRawMany();

      return { reports, totalPage, page };
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReportBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

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
