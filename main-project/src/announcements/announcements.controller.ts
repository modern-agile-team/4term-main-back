import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementDto } from './dto/announcement.dto';
import { AnnouncementFilterDto } from './dto/announcement-filter.dto';
import { Announcements } from './entity/announcement.entity';

@Controller('announcements')
@ApiTags('공지사항 API')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '공지사항 필터링 API',
    description: '공지사항을 필터링을 통해 내림차순으로 조회한다.',
  })
  async getAllAnnouncements(
    @Query() filter: AnnouncementFilterDto,
  ): Promise<object> {
    const announcements: Announcements[] =
      await this.announcementsService.getAnnouncements(filter);

    return { response: announcements };
  }

  @Get('/:announcementNo')
  @ApiOperation({
    summary: '특정 공지사항 조회 API',
    description: '번호를 통해 해당 공지사항을 조회한다.',
  })
  async getAnnouncementByNo(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
  ): Promise<object> {
    const announcement: Announcements =
      await this.announcementsService.getAnnouncementByNo(announcementNo);

    return { response: announcement };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '입력한 정보로 공지사항을 생성한다.',
  })
  async createAnnouncement(
    @Body() announcementDto: AnnouncementDto,
  ): Promise<object> {
    const announcement: string =
      await this.announcementsService.createAnnouncement(announcementDto);

    return { response: { announcement } };
  }

  // Patch Methods
  @Patch('/:announcementNo')
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '입력한 정보로 공지사항을 수정한다.',
  })
  async updateAnnouncement(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
    @Body() announcementDto: AnnouncementDto,
  ): Promise<object> {
    const announcement: string =
      await this.announcementsService.updateAnnouncement(
        announcementNo,
        announcementDto,
      );

    return { response: { announcement } };
  }
}
