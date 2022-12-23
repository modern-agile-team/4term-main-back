import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ReportUser } from '../entity/user-reports.entity';
import { ReportIF } from '../interface/reports.interface';

@EntityRepository(ReportUser)
export class UserReportRepository extends Repository<ReportUser> {
  //신고글 조회 관련
  async getAllUserReports(): Promise<ReportIF[]> {
    try {
      const reportedusers = this.createQueryBuilder('userReports')
        .leftJoin('userReports.reportNo', 'reports')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'userReports.targetUserNo as targetUserNo',
        ])
        .where('userReports.reportNo > 0')
        .getRawMany();

      return reportedusers;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllReportedusers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createUserReport(
    reportNo: number,
    userNo: number,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportUser)
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
