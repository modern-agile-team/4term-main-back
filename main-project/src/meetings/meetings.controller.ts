import {
  Param,
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { APIResponse } from 'src/common/interface/interface';
import { ApiCreateMeeting } from './swagger-decorator/create-meeting.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('약속 API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @ApiCreateMeeting()
  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    const meetingNo: number = await this.meetingsService.createMeeting(
      createMeetingDto,
      userNo,
    );

    return {
      msg: '약속 생성 성공',
      response: { meetingNo },
    };
  }

  @ApiOperation({
    summary: '약속 삭제',
    description: '약속 번호에 해당되는 약속 삭제',
  })
  @Delete('/:meetingNo')
  async deleteMeeting(
    @Param('meetingNo') meetingNo: number,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    await this.meetingsService.deleteMeeting(userNo, meetingNo);

    return {
      msg: '약속이 삭제되었습니다.',
    };
  }

  @ApiOperation({
    summary: '약속 수정',
    description: '약속 장소/시간 수정 (호스트 측 인원만 수정 가능)',
  })
  @Patch('/:meetingNo')
  async updateMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
    @GetUser() userNo: number,
  ): Promise<object> {
    await this.meetingsService.updateMeeting(
      userNo,
      meetingNo,
      updateMeetingDto,
    );

    return { success: true, msg: `약속이 수정되었습니다` };
  }

  @ApiOperation({
    summary: '약속 수락',
    description: 'meetingNo를 통해 약속 수락(게스트 측 인원만 수정 가능)',
  })
  @Patch('/:meetingNo/accept')
  async acceptMeeting(
    @Param('meetingNo') meetingNo: number,
    @GetUser() userNo: number,
  ): Promise<object> {
    await this.meetingsService.acceptMeeting(meetingNo, userNo);

    return { success: true, msg: `약속이 수락되었습니다` };
  }
}
