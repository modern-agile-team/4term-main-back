import { Body, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private readonly mannersService: MannersService) {}

  @ApiOperation({
    summary: '매너평점을 가져오는 API',
    description: '유저의 매너평점을 가져와준다.',
  })
  @Get('/:boardNo')
  async getScore(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
  ): Promise<object> {
    const response = await this.mannersService.getScore(boardNo, userNo);
    return { response };
  }
  @ApiOperation({
    summary: '매너평점을 가져오는 API',
    description: '유저의 매너평점을 가져와준다.',
  })
  @Get('/')
  async getScoreByProfile(
    @Body('userProfileNo', ParseIntPipe) userProfileNo: number,
  ): Promise<object> {
    const response = await this.mannersService.userGradebyUserProfileNo(
      userProfileNo,
    );
    return { response };
  }
}
