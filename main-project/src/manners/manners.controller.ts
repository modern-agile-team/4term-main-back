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
  @Get('/:meetingNo')
  async findMeetingByNo(
    @Param('meetingNo') meetingNo: number,
  ): Promise<object> {
    try {
      const meeting = await this.mannersService.findMeetingByNo(meetingNo);

      return {
        success: true,
        msg: ' 존재하는 파티/약속입니다.',
        meeting,
      };
    } catch (error) {
      throw error;
    }
  }
}
