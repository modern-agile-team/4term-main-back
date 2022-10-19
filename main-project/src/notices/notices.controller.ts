import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { NoticesService } from './notices.service';

@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get('/user')
  async getNoticeByUser(@Body('userNo') userNo: number) {
    try {
      await this.noticesService.getNoticeByConditions({ userNo });
    } catch (err) {
      throw err;
    }
  }

  @Patch()
  async readNotice(@Body('noticeNo') noticeNo: number) {
    try {
      await this.noticesService.readNotice(noticeNo);
    } catch (err) {
      throw err;
    }
  }
}
