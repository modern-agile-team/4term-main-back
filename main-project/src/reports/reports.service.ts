import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  constructor(
    private readonly boardRepository: BoardsRepository,
    private readonly boardReportRepository: ReportBoardRepository,
    private readonly userReportRepository: ReportUserRepository,
  ) {}
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

  async getAllBoardReports(): Promise<Report<string[]>[]> {
    const reportedBoards: Report<string[]>[] =
      await this.boardReportRepository.getAllBoardReports();

    if (!reportedBoards) {
      throw new NotFoundException(
        `게시글 신고내역 전체 조회(getAllReportedusers): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reportedBoards;
  }

  async getAllUserReports(): Promise<Report<string[]>[]> {
    const reportedUsers: Report<string[]>[] =
      await this.userReportRepository.getAllUserReports();

    if (!reportedUsers) {
      throw new NotFoundException(
        `사용자 신고내역 전체 조회(getAllReportedusers): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reportedUsers;
  }

  async getReport(
    manager: EntityManager,
    reportNo: number,
  ): Promise<Report<string[]>> {
    const report: Report<string[]> = await manager
      .getCustomRepository(ReportRepository)
      .getReport(reportNo);

    if (!report.no) {
      throw new NotFoundException(
        `${reportNo}번 신고내역 상세 조회(getReportByNo): 알 수 없는 서버 에러입니다.`,
      );
    }

    !report.targetBoardNo
      ? delete report.targetBoardNo
      : delete report.targetUserNo;

    return report;
  }

  // 생성 관련
  async createBoardReport(
    manager: EntityManager,
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<void> {
    const board: Board<number[]> = await this.boardRepository.getBoardByNo(
      boardNo,
    );
    if (!board.no) {
      throw new BadRequestException(`
        게시글 신고 생성(createBoardReport): ${boardNo}번 게시글을 찾을 수 없습니다.
        `);
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

    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(ReportUserRepository)
      .createUserReport(reportNo, userNo);

    if (!insertId) {
      throw new InternalServerErrorException(
        `사용자 신고 생성(createUserReport): 알 수 없는 서버 에러입니다.`,
      );
    }
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
  ): Promise<string> {
    await this.getReport(manager, reportNo);
    await manager.getCustomRepository(ReportRepository).deleteReport(reportNo);

    return `${reportNo}번 신고내역 삭제 성공 :)`;
  }
}
