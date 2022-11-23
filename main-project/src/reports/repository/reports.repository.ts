import { InternalServerErrorException } from '@nestjs/common';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateReportDto } from '../dto/create-reports.dto';
import { UpdateReportDto } from '../dto/update-reports.dto';
import { Reportedboards } from '../entity/reported-board.entity';
import { ReportedUsers } from '../entity/reported-user.entity';
import { Reports } from '../entity/reports.entity';
import {
  ReportDetail,
  ReportCreateResponse,
  ReportReadResponse,
} from '../interface/reports.interface';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
  //신고글 조회 관련

  async getAllReports(): Promise<ReportReadResponse[]> {
    try {
      const reports = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedBoard', 'reportedBoard')
        .leftJoin('reports.reportedUser', 'reportedUser')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedBoard.targetBoardNo as tagetBoardNo',
          'reportedUser.targetUserNo as tagetUserNo',
        ])
        .orderBy('reports.no', 'DESC')
        .getRawMany();

      return reports;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllreports-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllReportedBoards(): Promise<ReportReadResponse[]> {
    try {
      const reportedBoards = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedBoard', 'reportedBoard')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedBoard.targetBoardNo as targetBoardNo',
        ])
        .where('reportedBoard.reportNo > 0')
        .getRawMany();

      return reportedBoards;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllReportedBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllReportedusers(): Promise<ReportReadResponse[]> {
    try {
      const reportedusers = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedUser', 'reportedUser')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedUser.targetUserNo as targetUserNo',
        ])
        .where('reportedUser.reportNo > 0')
        .getRawMany();

      return reportedusers;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllReportedusers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getReportByNo(reportNo: number): Promise<ReportReadResponse> {
    try {
      const report = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedBoard', 'reportedBoard')
        .leftJoin('reports.reportedUser', 'reportedUser')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedBoard.targetBoardNo as targetBoardNo',
          'reportedUser.targetUserNo as targetUserNo',
        ])
        .where('reports.no=:reportNo', { reportNo })
        .getRawOne();

      return report;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReportByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createBoardReport(
    reportDetail: ReportDetail,
  ): Promise<ReportCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Reportedboards)
        .values(reportDetail)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoardReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUserReport(
    reportDetail: ReportDetail,
  ): Promise<ReportCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportedUsers)
        .values(reportDetail)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createUserReport-repository: 알 수 없는 서버 에러입니다.`,
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

  //게시글 수정 관련
  async updateReport(
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Reports)
        .set(updateReportDto)
        .where('no = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고 삭제 관련
  async deleteUserReport(reportNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'reportedUsers',
      )
        .delete()
        .from(ReportedUsers)
        .where('reportNo = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteUserReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteBoardReport(reportNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'reportedBoards',
      )
        .delete()
        .from(Reportedboards)
        .where('reportNo = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoardReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteReport(reportNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'reports',
      )
        .delete()
        .from(Reports)
        .where('no = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
