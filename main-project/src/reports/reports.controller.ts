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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { EntityManager } from 'typeorm';
import { CreateReportBoardDto } from './dto/create-report-board.dto';
import { CreateReportUserDto } from './dto/create-report-user.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { UpdateReportDto } from './dto/update-report-board.dto';
import { Report } from './interface/reports.interface';
import { ReportsService } from './reports.service';
import { ApiCreateReportBoard } from './swagger-decorator/create-board-report.decorator';
import { ApiCreateReportUser } from './swagger-decorator/create-user-report.decorator';
import { ApiDeleteReport } from './swagger-decorator/delete-report.decorator';
import { ApiGetReport } from './swagger-decorator/get-report.decorator';
import { ApiGetReports } from './swagger-decorator/get-reports.decorator';
import { ApiUpdateReport } from './swagger-decorator/update-report.decorator';

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
    const reportPagenation = await this.reportsService.getReports(
      manager,
      reportFilterDto,
    );

    return {
      msg: '신고내역 전체/필터 조회 성공',
      response: { reportPagenation },
    };
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
  @Post('/boards')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiCreateReportBoard()
  async createBoardReport(
    @TransactionDecorator() manager: EntityManager,
    @Body() createReportDto: CreateReportBoardDto,
    @GetUser() userNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<object> {
    await this.reportsService.createBoardReport(
      manager,
      createReportDto,
      files,
      userNo,
    );

    return { msg: '게시글 신고 성공' };
  }

  @Post('/users')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiCreateReportUser()
  async createUserReport(
    @TransactionDecorator() manager: EntityManager,
    @Body() createReportUserDto: CreateReportUserDto,
    @GetUser() userNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<object> {
    await this.reportsService.createUserReport(
      manager,
      createReportUserDto,
      files,
      userNo,
    );

    return { msg: '유저 신고 성공' };
  }

  // Patch Methods
  @Patch('/:reportNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiUpdateReport()
  async updateBoard(
    @Param('reportNo', ParseIntPipe) reportNo: number,
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Body() updateReportDto: UpdateReportDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<object> {
    await this.reportsService.editReport(
      manager,
      reportNo,
      updateReportDto,
      userNo,
      files,
    );

    return { msg: '신고내역 수정 성공' };
  }

  // Delete Methods
  @Delete('/:reportNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiDeleteReport()
  async deleteReport(
    @Param('reportNo', ParseIntPipe) reportNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<object> {
    const report = await this.reportsService.deleteReport(
      manager,
      reportNo,
      userNo,
    );

    return { msg: '게시글 신고 삭제 성공' };
  }
}
