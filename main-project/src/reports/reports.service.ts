import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
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
    @InjectRepository(BoardsService)
    private readonly reportRepository: ReportRepository,
    private readonly boardsService: BoardsService,
  ) {}
  // 신고글 조회 관련
  async getAllReports(): Promise<ReportReadResponse[]> {
    try {
      const boards: ReportReadResponse[] =
        await this.reportRepository.getAllReports();

      if (!boards) {
        throw new NotFoundException(`전체 Reports의 조회를 실패 했습니다.`);
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
        throw new NotFoundException(`전체 Boards 신고의 조회를 실패 했습니다.`);
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
        throw new NotFoundException(`전체 Users 신고의 조회를 실패 했습니다.`);
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
          `${reportNo}번 신고 내역의 조회를 실패 했습니다.`,
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
  async setReport(createReportDto: CreateReportDto): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createReport(createReportDto);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`report 생성 오류입니다.`);
    }
    return insertId;
  }

  async setBoardReport(reportDetail: ReportDetail): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createBoardReport(reportDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`board-report 생성 오류입니다.`);
    }
    return insertId;
  }

  async setUserReport(reportDetail: ReportDetail): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createUserReport(reportDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`user-report 생성 오류입니다.`);
    }
    return insertId;
  }

  async createBoardReport(
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<number> {
    try {
      await this.boardsService.getBoardByNo(boardNo);

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
      // await this.boardsService.getBoardByNo(boardNo);
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
  ): Promise<void> {
    try {
      await this.getReportByNo(reportNo);

      await this.reportRepository.updateReport(reportNo, updateReportDto);
    } catch (error) {
      throw error;
    }
  }

  // 신고 삭제 관련
  async deleteReportByNo(reportNo: number): Promise<string> {
    try {
      const report: ReportReadResponse = await this.getReportByNo(reportNo);
      !report.targetBoardNo
        ? await this.reportRepository.deleteUserReport(reportNo)
        : await this.reportRepository.deleteBoardReport(reportNo);

      await this.reportRepository.deleteReport(reportNo);

      return `${reportNo}번 신고내역 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
