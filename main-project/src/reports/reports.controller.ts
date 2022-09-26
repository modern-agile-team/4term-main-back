import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-reports.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('신고 API')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

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
