import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { EntityManager } from 'typeorm';
import { CreateReportDto } from './dto/create-reports.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { UpdateReportDto } from './dto/update-reports.dto';
import { Report } from './interface/reports.interface';
import { ReportsService } from './reports.service';
import { ApiGetReport } from './swagger-decorator/get-report.decorator';
import { ApiGetReports } from './swagger-decorator/get-reports.decorator';

@Controller('reports')
@ApiTags('신고 API')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  // Get
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetReports()
  async getReports(
    @TransactionDecorator() manager: EntityManager,
    @Query() reportFilterDto: ReportFilterDto,
  ): Promise<object> {
    const reports: Report<string[]>[] = await this.reportsService.getReports(
      manager,
      reportFilterDto,
    );

    return { msg: '신고내역 전체/필터 조회 성공', response: { reports } };
  }

  @Get('/:reportNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetReport()
  async getReport(
    @TransactionDecorator() manager: EntityManager,
    @Param('reportNo', ParseIntPipe) reportNo: number,
  ): Promise<object> {
    const report: Report<string[]> = await this.reportsService.getReport(
      manager,
      reportNo,
    );

    return { msg: '신고내역 상세조회 성공', response: { report } };
  }

  // Post
  @Post('/boards/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 신고 생성 API',
    description: '입력된 정보로 게시글 신고 생성.',
  })
  async createBoardReport(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Body() createReportDto: CreateReportDto,
  ): Promise<object> {
    await this.reportsService.createBoardReport(
      manager,
      createReportDto,
      boardNo,
    );

    return { msg: '게시글 신고 성공' };
  }

  @Post('/users/:userNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '사용자 신고 생성 API',
    description: '입력된 정보로 사용자 신고 생성.',
  })
  async createUserReport(
    @Param('userNo', ParseIntPipe) userNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Body() createReportDto: CreateReportDto,
  ): Promise<object> {
    await this.reportsService.createUserReport(
      manager,
      createReportDto,
      userNo,
    );

    return { msg: '유저 신고 성공' };
  }

  // Patch Methods
  @Patch('/:reportNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '신고내용 수정 API',
    description: '입력한 정보로 신고내용을 수정한다.',
  })
  async updateBoard(
    @Param('reportNo', ParseIntPipe) reportNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<object> {
    await this.reportsService.updateReport(manager, reportNo, updateReportDto);

    return { msg: '신고내역 수정 성공' };
  }

  // Delete Methods
  @Delete('/:reportNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '특정 신고내역 삭제 API',
    description: '신고 번호를 사용하여 해당 신고내역을 삭제한다.',
  })
  async deleteReportByNo(
    @Param('reportNo', ParseIntPipe) reportNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<object> {
    const response = await this.reportsService.deleteReportByNo(
      manager,
      reportNo,
    );

    return { response };
  }
}
