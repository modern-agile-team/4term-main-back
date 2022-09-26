import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { CreateReportDto } from './dto/create-reports.dto';
import { ReportRepository } from './repository/reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(BoardRepository)
    @InjectRepository(ReportRepository)
    private readonly reportRepository: ReportRepository,
    private readonly boardRepository: BoardRepository,
  ) {}

  async createBoardReport(
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<number> {
    try {
      console.log(12);

      //   const { affectedRows, insertId }: BoardCreateResponse =
      //     await this.boardRepository.createBoard(createBoardDto);

      //   if (!(affectedRows && insertId)) {
      //     throw new InternalServerErrorException(`board 생성 오류입니다.`);
      //   }

      //   return insertId;
      return 1;
    } catch (error) {
      throw error;
    }
  }
}
