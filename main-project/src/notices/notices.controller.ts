import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { NoticesService } from './notices.service';

@Controller('notices')
@ApiTags('알림 API')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @ApiOperation({ summary: '특정 유저의 모든 알림 조회' })
  @Get('/user')
  async getNoticeByUser(@Body('userNo') userNo: number) {
    return await this.noticesService.getNoticeByUserNo(userNo);
  }

  @ApiOperation({ summary: '알림 읽음 처리' })
  @Patch('/:noticeNo')
  async readNotice(@Param('noticeNo') noticeNo: number) {
    try {
      await this.noticesService.readNotice(noticeNo);
    } catch (err) {
      throw err;
    }
  }
}
