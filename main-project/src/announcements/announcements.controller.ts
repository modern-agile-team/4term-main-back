import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementDto } from './dto/announcement.dto';

@Controller('announcements')
@ApiTags('공지사항 API')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) { }
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '공지사항 전체 조회 API',
    description: '공지사항 전부를 내림차순으로 조회한다.',
  })
  async getAllAnnouncements(): Promise<object> {
    const response: AnnouncementDto[] =
      await this.announcementsService.getAllAnnouncements();

    return { response };
  }

  @Get('/:announcementNo')
  @ApiOperation({
    summary: '특정 공지사항 조회 API',
    description: '번호를 통해 해당 공지사항을 조회한다.',
  })
  async getAnnouncementByNo(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
  ): Promise<object> {
    const response: object =
      await this.announcementsService.getAnnouncementByNo(announcementNo);

    return { response };
  }
}
