import {
  Param,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meeting } from './entity/meeting.entity';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
  ): Promise<object> {
    const meeting = await this.meetingsService.createMeeting(createMeetingDto);

    return {
      success: true,
      meeting,
    };
  }

  @Patch()
  async updateMeeting(
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<object> {
    await this.meetingsService.updateMeeting(updateMeetingDto);

    return { success: true, msg: `약속이 수정되었습니다` };
  }

  @Patch('/accept/:meetingNo')
  async acceptMeeting(@Param('meetingNo') meetingNo: number): Promise<object> {
    await this.meetingsService.acceptMeeting(meetingNo);

    return { success: true, msg: `약속이 수정되었습니다` };
  }
}
