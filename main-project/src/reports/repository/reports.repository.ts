import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateReportDto } from '../dto/create-reports.dto';
import { Reportedboards } from '../entity/reported-board.entity';
import { Reports } from '../entity/reports.entity';
import {
  BoardReportDetail,
  ReportCreateResponse,
  ReportReadResponse,
} from '../interface/reports.interface';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
  //신고글 조회 관련

  async getAllReports(): Promise<ReportReadResponse[]> {
    try {
      const reports = this.createQueryBuilder('reports')
        .select([
          'reports.no AS no',
          'reports.userNo AS user_no',
          'reports.title AS title',
          'reports.description AS description',
        ])
        .getRawMany();

      return reports;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllreports-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createBoardReport(
    boardReportDetail: BoardReportDetail,
  ): Promise<ReportCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Reportedboards)
        .values(boardReportDetail)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createReport(
    createReportDto: CreateReportDto,
  ): Promise<ReportCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Reports)
        .values(createReportDto)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
