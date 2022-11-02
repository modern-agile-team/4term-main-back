import {
  Param,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { DeleteGuestDto } from 'src/meetings/dto/deleteGuest.dto';
import { DeleteHostDto } from './dto/deleteHost.dto';
import { InviteMemberDto } from './dto/inviteMember.dto';
import { ApplyForMeetingDto } from './dto/applyForMeeting.dto';
import { AcceptInvitaionDto } from './dto/acceptInvitation.dto';
import { AcceptMeetingDto } from './dto/acceptMeeting.dto';
import { NoticeType } from 'src/common/configs/notice-type.config';

@Controller('meetings')
@ApiTags('약속 API')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '새로운 약속 생성',
    description: '약속 시간/장소를 입력하여 약속 생성',
  })
  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
  ): Promise<object> {
    try {
      const meetingNo: number = await this.meetingsService.createMeeting(
        createMeetingDto,
      );

      return {
        success: true,
        msg: '약속이 생성되었습니다.',
        meetingNo,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '게스트의 약속 참여 요청 수락',
    description: 'noticeNo를 통해 호스트가 게스트의 약속 참여 요청 수락',
  })
  @Patch('/accept/application/:noticeNo')
  async acceptGuestApplication(
    @Param('noticeNo') noticeNo: number,
    @Body('userNo') userNo: number,
  ): Promise<object> {
    try {
      await this.meetingsService.acceptGuests(noticeNo, userNo);

      return { success: true, msg: `게스트의 참여 요청이 수락되었습니다.` };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '약속 초대 요청 수락(개인)',
    description:
      'noticeNo를 통해 초대 요청을 수락하여 새로운 멤버로 약속에 참여',
  })
  @Patch('/accept/invitation/:noticeNo')
  async acceptInvitation(
    @Param('noticeNo') noticeNo: number,
    @Body() { userNo }: AcceptInvitaionDto,
  ) {
    try {
      await this.meetingsService.acceptInvitation(userNo, noticeNo);

      return {
        succes: true,
        msg: `초대 요청이 수락되었습니다.`,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '약속 수정',
    description: '약속 장소/시간 수정(호스트 대표만 수정 가능)',
  })
  @Patch('/:meetingNo')
  async updateMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<object> {
    try {
      await this.meetingsService.updateMeeting(meetingNo, updateMeetingDto);

      return { success: true, msg: `약속이 수정되었습니다` };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: '약속 수락',
    description: 'meetingNo를 통해 약속 수락(게스트 대표만 수락 가능)',
  })
  @Patch('/:meetingNo/accept')
  async acceptMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() { userNo }: AcceptMeetingDto,
  ): Promise<object> {
    try {
      await this.meetingsService.acceptMeeting(meetingNo, userNo);

      return { success: true, msg: `약속이 수락되었습니다` };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '약속에 참여 신청',
    description: '약속에 게스트로 참여 신청(신청자가 게스트 대표)',
  })
  @Post('/:meetingNo/apply')
  async applyForMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() applyForMeetingDto: ApplyForMeetingDto,
  ): Promise<object> {
    try {
      await this.meetingsService.applyForMeeting(meetingNo, applyForMeetingDto);

      return { success: true, msg: `약속 신청이 완료되었습니다.` };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '참여 신청 취소',
  })
  @Delete('/:meetingNo/apply')
  async retractApplication(
    @Param('meetingNo') meetingNo: number,
    @Body('userNo') userNo: number,
  ): Promise<object> {
    try {
      await this.meetingsService.retractApplication(meetingNo, userNo);

      return { success: true, msg: `약속 신청이 취소되었습니다.` };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '새로운 게스트 멤버 초대',
    description: '참여 중인 약속에 새로운 멤버 초대',
  })
  @Post('/:meetingNo/invite/guest')
  async inviteGuestMember(
    @Param('meetingNo') meetingNo: number,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    try {
      await this.meetingsService.inviteMember(
        meetingNo,
        inviteMemberDto,
        NoticeType.INVITE_GUEST,
      );

      return {
        succes: true,
        msg: `약속 초대 알림이 전송되었습니다.`,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '새로운 호스트 멤버 초대',
    description: '참여 중인 약속에 새로운 멤버 초대',
  })
  @Post('/:meetingNo/invite/host')
  async invitHostMember(
    @Param('meetingNo') meetingNo: number,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    try {
      await this.meetingsService.inviteMember(
        meetingNo,
        inviteMemberDto,
        NoticeType.INVITE_HOST,
      );

      return {
        succes: true,
        msg: `약속 초대 알림이 전송되었습니다.`,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '게스트 삭제',
    description: 'meetingNo에 해당하는 약속의 특정 게스트 삭제',
  })
  @Delete('/:meetingNo/guest')
  async deleteGuest(
    @Param('meetingNo') meetingNo: number,
    @Body() deleteGuestDto: DeleteGuestDto,
  ) {
    try {
      await this.meetingsService.deleteGuest(meetingNo, deleteGuestDto);

      return {
        success: true,
        msg: `게스트가 삭제되었습니다.`,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '호스트 삭제',
    description: 'meetingNo에 해당하는 약속의 특정 호스트 삭제',
  })
  @Delete('/:meetingNo/host')
  async deleteHost(
    @Param('meetingNo') meetingNo: number,
    @Body() { userNo }: DeleteHostDto,
  ) {
    try {
      await this.meetingsService.deleteHost(meetingNo, userNo);

      return {
        success: true,
        msg: '호스트가 삭제되었습니다.',
      };
    } catch (err) {
      throw err;
    }
  }
}
