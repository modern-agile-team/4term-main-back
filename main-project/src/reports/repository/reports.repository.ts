import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateReportDto } from '../dto/create-reports.dto';
import { Reportedboards } from '../entity/reported-board.entity';
import { Reports } from '../entity/reports.entity';
import {
  BoardReportDetail,
  ReportCreateResponse,
} from '../interface/reports.interface';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
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
