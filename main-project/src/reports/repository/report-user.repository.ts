import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ReportUsers } from '../entity/report-user.entity';
import { Report, ReportPagenation } from '../interface/reports.interface';

@EntityRepository(ReportUsers)
export class ReportUserRepository extends Repository<ReportUsers> {
  async getReportUsers(page: number): Promise<ReportPagenation> {
    try {
      const query: SelectQueryBuilder<ReportUsers> = this.createQueryBuilder(
        'reportUsers',
      )
        .leftJoin('reportUsers.reportNo', 'reports')
        .select([
          'reportUsers.no AS no',
          'reportUsers.report_no AS reportNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportUsers.target_user_no AS targetUserNo',
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
        `${error} getReportUsers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getReportUser(reportNo: number): Promise<ReportUsers> {
    try {
      const reportUser: ReportUsers = await this.createQueryBuilder()
        .select()
        .where('report_no = :reportNo', { reportNo })
        .getOne();

      return reportUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReportUser-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUserReport(
    reportNo: number,
    userNo: number,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportUsers)
        .values({ reportNo, targetUserNo: userNo })
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createUserReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
