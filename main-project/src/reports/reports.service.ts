import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { CreateReportDto } from './dto/create-reports.dto';
import {
  BoardReportDetail,
  ReportCreateResponse,
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

  async setReport(createReportDto: CreateReportDto): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createReport(createReportDto);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`report 생성 오류입니다.`);
    }
    return insertId;
  }

  async setBoardReport(boardReportDetail: BoardReportDetail): Promise<number> {
    const { affectedRows, insertId }: ReportCreateResponse =
      await this.reportRepository.createBoardReport(boardReportDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`board-report 생성 오류입니다.`);
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

      const boardReportDetail: BoardReportDetail = {
        reportNo,
        targetBoardNo: boardNo,
      };

      await this.setBoardReport(boardReportDetail);

      return reportNo;
    } catch (error) {
      throw error;
    }
  }
}
