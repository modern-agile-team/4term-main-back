import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller('announcements')
@ApiTags('공지사항 API')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '입력한 정보로 공지사항을 생성한다.',
  })
  async createBoard(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<object> {
    const announcement: number =
      await this.announcementsService.createAnnouncement(createAnnouncementDto);
    const response = { success: true, announcement };

    return response;
  }
}
