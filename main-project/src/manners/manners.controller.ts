import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MannerDto } from './dto/createManners.dto';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private readonly mannersService: MannersService) {}

  @Post('/:chatRoomNo/notice')
  @ApiOperation({
    summary: '매너로그 알람 생성',
    description: '매너로그 평점 알람 생성',
  })
  async createMannerNotice(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
  ): Promise<{ msg: string }> {
    await this.mannersService.createMannerNotice(chatRoomNo);

    return {
      msg: '알람 생성',
    };
  }

  @ApiOperation({
    summary: '매너평점을 가져오는 API',
    description: '유저의 매너평점을 가져와준다.',
  })
  @Get('/:meetingNo')
  async getScore(
    @Param('meetingNo', ParseIntPipe) meetingNo: number,
    @Body('chatUserNo') userNo: number,
  ): Promise<object> {
    const response = await this.mannersService.getScore(meetingNo, userNo);
    return { response };
  }

  @ApiOperation({
    summary: '매너평점을 가져오는 API',
    description: '프로필 상 유저의 매너평점을 가져와준다.',
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

  @ApiOperation({
    summary: '매너평점을 주는 API',
    description: '유저에게 매너평점을 남긴다.',
  })
  @Post('/give/manner')
  @HttpCode(201)
  async giveScore(
    @Body()
    mannerInfo: MannerDto,
  ): Promise<object> {
    const response = await this.mannersService.giveScore(mannerInfo);

    return { response };
  }

  @ApiOperation({
    summary: '매너로그 수정 API',
    description: '매너로그 평점수정',
  })
  @Patch('/log/:chatRoomNo')
  async updateMannerLog(
    @Body() mannerLog: MannerDto,
    @Param('chatRoomNo') chatRoomNo: number,
  ) {
    const response = await this.mannersService.updateMannerLog(
      chatRoomNo,
      mannerLog,
    );
    return { response };
  }

  @ApiOperation({ summary: '매너 수정 API', description: '매너평점 수정' })
  @Patch('/:chatUserNo')
  async updateManner(@Param('chatUserNo') userNo: number) {}
}
