import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ReportUsers } from '../entity/report-user.entity';

@EntityRepository(ReportUsers)
export class ReportUserRepository extends Repository<ReportUsers> {
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
