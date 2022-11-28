import { Body, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BodyAndParam } from 'src/common/decorator/body-and-param.decorator';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private readonly mannersService: MannersService) {}

  @ApiOperation({
    summary: '매너평점을 남겨주는 API',
    description: '매너평점을 남겨줄 수 있다.',
  })
  @Get('/:boardNo')
  async giveScore(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
  ): Promise<object> {
    try {
      const board = await this.mannersService.giveScore(boardNo, userNo);
      return {
        board,
        success: true,
        msg: ' 존재하는 게시물입니다.',
      };
    } catch (error) {
      throw error;
    }
  }
}
