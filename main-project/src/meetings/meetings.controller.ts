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
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { MeetingsService } from './meetings.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Users } from 'src/users/entity/user.entity';
import { DeleteGeustDto } from 'src/members/dto/deleteGuest.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: '새로운 약속 생성',
  })
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

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: '약속 장소/시간 수정',
  })
  @Patch('/:meetingNo')
  async updateMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<object> {
    await this.meetingsService.updateMeeting(meetingNo, updateMeetingDto);

    return { success: true, msg: `약속이 수정되었습니다` };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: '약속 수락',
  })
  @Patch('/accept/:meetingNo')
  async acceptMeeting(@Param('meetingNo') meetingNo: number): Promise<object> {
    await this.meetingsService.acceptMeeting(meetingNo);

    return { success: true, msg: `약속이 수락되었습니다` };
  }

  @Post('/guest/initial/:meetingNo')
  async setGuestMembers(
    @Param('meetingNo') meetingNo: number,
    @Body('guest') guest: Users[],
  ): Promise<object> {
    await this.meetingsService.setGuestMembers({ meetingNo, guest });

    return { success: true, msg: `게스트가 추가되었습니다` };
  }

  @Delete('/guest/:meetingNo/:userNo') //후에 토큰에서 userNo 받아오도록 수정
  async deleteGuest(
    @Param('meetingNo') meetingNo: number,
    @Param('userNo') userNo: number,
    @Body('adminGuest') adminGuest: number,
  ) {
    const deleteGuestDto: DeleteGeustDto = { meetingNo, userNo, adminGuest };
    await this.meetingsService.deleteGuest(deleteGuestDto);
  }
}
