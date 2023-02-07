import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Board } from 'src/boards/interface/boards.interface';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { EntityManager } from 'typeorm';
import { CreateReportDto } from './dto/create-reports.dto';
import { UpdateReportDto } from './dto/update-reports.dto';
import { Report } from './interface/reports.interface';
import { ReportBoardRepository } from './repository/report-board.repository';
import { ReportRepository } from './repository/reports.repository';
import { ReportUserRepository } from './repository/report-user.repository';
import { ResultSetHeader } from 'mysql2';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly boardRepository: BoardsRepository) {}
  // 조회 관련
  async getReports(
    manager: EntityManager,
    reportFilterDto: ReportFilterDto,
  ): Promise<Report<string[]>[]> {
    const reports: Report<string[]>[] = await manager
      .getCustomRepository(ReportRepository)
      .getReports(reportFilterDto);

    if (!reports.length) {
      throw new NotFoundException(
        `신고내역 전체 조회(getReports): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reports;
  }

  async getReport(
    manager: EntityManager,
    reportNo: number,
  ): Promise<Report<string[]>> {
    const report: Report<string[]> = await this.readReport(manager, reportNo);

    if (!report.no) {
      throw new NotFoundException(
        `신고내역 상세 조회(getReport): ${reportNo}번 신고내역이 없습니다.`,
      );
    }

    return report;
  }

  private async readReport(
    manager: EntityManager,
    reportNo: number,
  ): Promise<Report<string[]>> {
    const report: Report<string[]> = await manager
      .getCustomRepository(ReportRepository)
      .getReport(reportNo);

    return report;
  }

  // 생성 관련
  async createBoardReport(
    manager: EntityManager,
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<void> {
    const { no }: Board<number[]> = await this.boardRepository.getBoardByNo(
      boardNo,
    );
    if (!no) {
      throw new BadRequestException(
        `게시글 신고 생성(createBoardReport-service): ${boardNo}번 게시글을 찾을 수 없습니다.`,
      );
    }

    const reportNo: number = await this.setReport(manager, createReportDto);

    await manager
      .getCustomRepository(ReportBoardRepository)
      .createBoardReport(reportNo, boardNo);
  }

  async createUserReport(
    manager: EntityManager,
    createReportDto: CreateReportDto,
    userNo: number,
  ): Promise<void> {
    // TODO: User 확인 Method 사용 부분

    const reportNo: number = await this.setReport(manager, createReportDto);

    await manager
      .getCustomRepository(ReportUserRepository)
      .createUserReport(reportNo, userNo);
  }

  private async setReport(
    manager: EntityManager,
    createReportDto: CreateReportDto,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(ReportRepository)
      .createReport(createReportDto);

    return insertId;
  }

  //수정 관련
  async updateReport(
    manager: EntityManager,
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<void> {
    await this.getReport(manager, reportNo);

    await manager
      .getCustomRepository(ReportRepository)
      .updateReport(reportNo, updateReportDto);
  }

  // 삭제 관련
  async deleteReportByNo(
    manager: EntityManager,
    reportNo: number,
  ): Promise<void> {
    await this.getReport(manager, reportNo);
    await manager.getCustomRepository(ReportRepository).deleteReport(reportNo);
  }
}
