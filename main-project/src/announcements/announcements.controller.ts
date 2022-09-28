import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('announcements')
@ApiTags('공지사항 API')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '공지사항 전체 조회 API',
    description: '공지사항 전부를 내림차순으로 조회한다.',
  })
  async getAllAnnouncements(): Promise<object> {
    const announcements: object =
      await this.announcementsService.getAllAnnouncements();
    const response = {
      success: true,
      announcements,
    };

    return response;
  }

  @Get('/:announcementNo')
  @ApiOperation({
    summary: '특정 공지사항 조회 API',
    description: '번호를 통해 해당 공지사항을 조회한다.',
  })
  async getAnnouncementByNo(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
  ): Promise<object> {
    const announcement: object =
      await this.announcementsService.getAnnouncementByNo(announcementNo);
    const response = {
      success: true,
      announcement,
    };

    return response;
  }

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

  // Patch Methods
  @Patch('/:announcementNo')
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '입력한 정보로 공지사항을 수정한다.',
  })
  async updateAnnouncement(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<object> {
    await this.announcementsService.updateAnnouncement(
      announcementNo,
      updateAnnouncementDto,
    );

    const response = {
      success: true,
      msg: `${announcementNo}번 공지사항이 수정되었습니다.`,
    };

    return response;
  }

  // Delete Methods
  @Delete('/:announcementNo')
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항 번호를 사용해 해당 공지사항을 삭제한다.',
  })
  async deleteAnnouncement(
    @Param('announcementNo', ParseIntPipe) announcementNo: number,
  ): Promise<string> {
    const announcement = await this.announcementsService.deleteAnnouncement(
      announcementNo,
    );

    return announcement;
  }
}
