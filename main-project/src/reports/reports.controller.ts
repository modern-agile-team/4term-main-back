import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-reports.dto';
import { UpdateReportDto } from './dto/update-reports.dto';
import { ReportIF } from './interface/reports.interface';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('신고 API')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  // Get
  @Get()
  @ApiOperation({
    summary: '신고 전체 조회 API',
    description: '신고내역을 전부 조회한다.',
  })
  async getAllReports(): Promise<object> {
    const response: ReportIF[] = await this.reportsService.getAllReports();

    return { response };
  }

  @Get('/:reportNo')
  @ApiOperation({
    summary: '신고 상세 조회 API',
    description: '신고 번호를 통해 해당 신고내역을 조회한다.',
  })
  async getReportByNo(
    @Param('reportNo', ParseIntPipe) reportNo: number,
  ): Promise<object> {
    const response: ReportIF = await this.reportsService.getReportByNo(
      reportNo,
    );

    return { response };
  }

  // Post
  @Post('/boards/:boardNo')
  @ApiOperation({
    summary: '게시글 신고 생성 API',
    description: '입력된 정보로 게시글 신고 생성.',
  })
  async createBoardReport(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() createReportDto: CreateReportDto,
  ): Promise<object> {
    const response: number = await this.reportsService.createBoardReport(
      createReportDto,
      boardNo,
    );

    return { response };
  }

  @Post('/users/:userNo')
  @ApiOperation({
    summary: '사용자 신고 생성 API',
    description: '입력된 정보로 사용자 신고 생성.',
  })
  async createUserReport(
    @Param('userNo', ParseIntPipe) userNo: number,
    @Body() createReportDto: CreateReportDto,
  ): Promise<object> {
    const response: number = await this.reportsService.createUserReport(
      createReportDto,
      userNo,
    );

    return { response };
  }

  // Patch Methods
  @Patch('/:reportNo')
  @ApiOperation({
    summary: '신고내용 수정 API',
    description: '입력한 정보로 신고내용을 수정한다.',
  })
  async updateBoard(
    @Param('reportNo', ParseIntPipe) reportNo: number,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<object> {
    const response: string = await this.reportsService.updateReport(
      reportNo,
      updateReportDto,
    );

    return { response };
  }

  // Delete Methods
  @Delete('/:reportNo')
  @ApiOperation({
    summary: '특정 신고내역 삭제 API',
    description: '신고 번호를 사용하여 해당 신고내역을 삭제한다.',
  })
  async deleteReportByNo(
    @Param('reportNo', ParseIntPipe) reportNo: number,
  ): Promise<object> {
    const response = await this.reportsService.deleteReportByNo(reportNo);

    return { response };
  }
}
