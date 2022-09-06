import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { Meeting } from './entity/meeting.entity';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMeeting(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingsService.createMeeting(createMeetingDto);
  }
}
