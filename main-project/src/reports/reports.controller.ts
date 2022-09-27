import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-reports.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('신고 API')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  // Get
  @Get()
  @ApiOperation({
    summary: '게시글 신고 전체 조회 API',
    description: '게시글 신고글들을 전부 조회한다.',
  })
  async getAllReports(): Promise<object> {
    const reports: object = await this.reportsService.getAllReports();
    const response = {
      success: true,
      reports,
    };

    return response;
  }

  @Get('/:reportNo')
  @ApiOperation({
    summary: '게시글 신고 전체 조회 API',
    description: '게시글 신고글들을 전부 조회한다.',
  })
  async getReportByNo(
    @Param('reportNo', ParseIntPipe) reportNo: number,
  ): Promise<object> {
    const report: object = await this.reportsService.getReportByNo(reportNo);
    const response = {
      success: true,
      report,
    };

    return response;
  }

  // Post
  @Post('/:boardNo')
  @ApiOperation({
    summary: '게시글 신고 생성 API',
    description: '입력된 정보로 게시글 신고 생성.',
  })
  async createBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() createReportDto: CreateReportDto,
  ): Promise<object> {
    const report: number = await this.reportsService.createBoardReport(
      createReportDto,
      boardNo,
    );
    const response = { success: true, report };

    return response;
  }
}
