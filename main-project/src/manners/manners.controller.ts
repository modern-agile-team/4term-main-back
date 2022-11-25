import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private readonly mannersService: MannersService) {}

  @ApiOperation({
    summary: '게시물 검색 API',
    description: '게시물이 있는지 검사한다.',
  })
  @Get('/:boardNo')
  async findBoardByNo(@Param('boardNo') boardNo: number): Promise<object> {
    try {
      const board = await this.mannersService.findBoardByNo(boardNo);

      return {
        success: true,
        msg: ' 존재하는 게시물입니다.',
        board,
      };
    } catch (error) {
      throw error;
    }
  }
}
