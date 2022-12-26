import {
  Param,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { AcceptMeetingDto } from './dto/acceptMeeting.dto';

@Controller('meetings')
@ApiTags('약속 API')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '새로운 약속 생성',
    description: '약속 시간/장소/채팅방 번호를 입력하여 약속 생성',
  })
  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
  ): Promise<object> {
    const meetingNo: number = await this.meetingsService.createMeeting(
      createMeetingDto,
    );

    return {
      success: true,
      meetingNo,
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '약속 삭제',
    description: '약속 번호에 해당되는 약속 삭제',
  })
  @Delete('/:meetingNo')
  async deleteMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body('userNo') userNo: number,
  ): Promise<object> {
    await this.meetingsService.deleteMeeting(meetingNo, userNo);

    return {
      success: true,
      msg: '약속이 삭제되었습니다.',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '약속 수정',
    description: '약속 장소/시간 수정 (호스트 측 인원만 수정 가능)',
  })
  @Patch('/:meetingNo')
  async updateMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<object> {
    await this.meetingsService.updateMeeting(meetingNo, updateMeetingDto);

    return { success: true, msg: `약속이 수정되었습니다` };
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: '약속 수락',
    description: 'meetingNo를 통해 약속 수락(게스트 측 인원만 수정 가능)',
  })
  @Patch('/:meetingNo/accept')
  async acceptMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() { userNo }: AcceptMeetingDto,
  ): Promise<object> {
    await this.meetingsService.acceptMeeting(meetingNo, userNo);

    return { success: true, msg: `약속이 수락되었습니다` };
  }
}
