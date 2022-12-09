import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Boards } from 'src/boards/entity/board.entity';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { CreateReportDto } from './dto/create-reports.dto';
import { UpdateReportDto } from './dto/update-reports.dto';
import {
  ReportDetail,
  ReportCreateResponse,
  ReportReadResponse,
} from './interface/reports.interface';
import { ReportRepository } from './repository/reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportRepository)
    @InjectRepository(BoardRepository)
    private readonly reportRepository: ReportRepository,
    private readonly boardRepository: BoardRepository,
  ) { }
  // 신고글 조회 관련
  async getAllReports(): Promise<ReportReadResponse[]> {
    try {
      const boards: ReportReadResponse[] =
        await this.reportRepository.getAllReports();

      if (!boards) {
        throw new NotFoundException(
          `전체 신고 조회 오류 getAllReports-service.`,
        );
      }

      return boards;
    } catch (error) {
      throw error;
    }
  }

  async getAllReportedBoards(): Promise<ReportReadResponse[]> {
    try {
      const reportedBoards: ReportReadResponse[] =
        await this.reportRepository.getAllReportedBoards();

      if (!reportedBoards) {
        throw new NotFoundException(
          `전체 게시글신고 조회 오류 getAllReports-service.`,
        );
      }

      return reportedBoards;
    } catch (error) {
      throw error;
    }
  }

  async getAllReportedusers(): Promise<ReportReadResponse[]> {
    try {
      const reportedUsers: ReportReadResponse[] =
        await this.reportRepository.getAllReportedusers();

      if (!reportedUsers) {
        throw new NotFoundException(
          `전체 사용자신고 조회 오류 getAllReportedusers-service.`,
        );
      }

      return reportedUsers;
    } catch (error) {
      throw error;
    }
  }

  async getReportByNo(reportNo: number): Promise<ReportReadResponse> {
    try {
      const report: ReportReadResponse =
        await this.reportRepository.getReportByNo(reportNo);

      if (!report) {
        throw new NotFoundException(
          `${reportNo}번 신고 조회 오류 getReportByNo-service.`,
        );
      }

      !report.targetBoardNo
        ? delete report.targetBoardNo
        : delete report.targetUserNo;

      return report;
    } catch (error) {
      throw error;
    }
  }

  // 신고글 작성 관련
  private async setReport(createReportDto: CreateReportDto): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createReport(createReportDto);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(
        `report 생성 오류 setReport-service.`,
      );
    }
    return insertId;
  }

  private async setBoardReport(reportDetail: ReportDetail): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createBoardReport(reportDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(
        `board-report 생성 오류 setReport-service.`,
      );
    }
    return insertId;
  }

  private async setUserReport(reportDetail: ReportDetail): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createUserReport(reportDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(
        `user-report 생성 오류 setUserReport-service.`,
      );
    }
    return insertId;
  }

  async createBoardReport(
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<number> {
    try {
      const board: Boards = await this.boardRepository.getBoardByNo(
        boardNo,
      );
      if (!board.no) {
        throw new BadRequestException(`해당 게시글이 없습니다.`);
      }

      const reportNo: number = await this.setReport(createReportDto);

      const reportDetail: ReportDetail = {
        reportNo,
        targetBoardNo: boardNo,
      };

      await this.setBoardReport(reportDetail);

      return reportNo;
    } catch (error) {
      throw error;
    }
  }

  async createUserReport(
    createReportDto: CreateReportDto,
    userNo: number,
  ): Promise<number> {
    try {
      // await this.usersService.getUserByNo(userNo);
      // User 확인 Method 사용 부분

      const reportNo: number = await this.setReport(createReportDto);

      const reportDetail: ReportDetail = {
        reportNo,
        targetUserNo: userNo,
      };

      await this.setUserReport(reportDetail);

      return reportNo;
    } catch (error) {
      throw error;
    }
  }

  //게시글 수정 관련
  async updateReport(
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<string> {
    try {
      await this.getReportByNo(reportNo);
      const report: number = await this.reportRepository.updateReport(
        reportNo,
        updateReportDto,
      );

      if (!report) {
        throw new InternalServerErrorException(
          `신고내역 수정 오류 updateReport-service.`,
        );
      }

      return `${reportNo}번 신고내역이 수정되었습니다.`;
    } catch (error) {
      throw error;
    }
  }

  // 신고 삭제 관련
  async deleteReportByNo(reportNo: number): Promise<string> {
    try {
      await this.getReportByNo(reportNo);
      await this.reportRepository.deleteReport(reportNo);

      return `${reportNo}번 신고내역 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
