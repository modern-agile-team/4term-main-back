import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private readonly mannersService: MannersService) {}

  @ApiOperation({
    summary: '파티, 약속 검색 API',
    description: '파티/약속이 있는지 검사한다.',
  })
  @Get('/:boardNo')
  async findboardByNo(@Param('boardNo') boardNo: number): Promise<object> {
    try {
      const board = await this.mannersService.findMeetingByNo(boardNo);

      return {
        success: true,
        msg: ' 존재하는 게시물입니다.',
        board,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    summary: '게시물, 상대, 자기 자신이 있는지 확인해주는 API',
    description:
      '특정 게시물 안에 상대방과 자기자신이 포함되어 있는지 검사한다.',
  })
  @Get('/boards/:boardNo')
  async findAllMembersByBoardNo(@Param('boardNo') boardNo: number) {
    try {
      // const findAllMembers = await this.mannersService.findAllMembers(boardNo);

      return {
        success: true,
        msg: `게시판 번호${boardNo}에 포함되어 있습니다.`,
        // findAllMembers,
      };
    } catch (error) {
      throw error;
    }
  }
}
