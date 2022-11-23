import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsControllerService } from './chats-controller.service';
import { ChatLog } from './entity/chat-log.entity';

@Controller('chats')
@ApiTags('채팅 APi')
export class ChatsController {
  constructor(private readonly chatControllerService: ChatsControllerService) {}

  @Get('/:userNo')
  @ApiOperation({
    summary: '채팅 목록 API',
    description: ' 채팅 목록 조회',
  })
  async getChatRoomList(@Param('userNo') userNo: number): Promise<object> {
    const response = await this.chatControllerService.getChatRoomListByUserNo(
      userNo,
    );
    return {
      response,
    };
  }

  @Get('/join/:chatRoomNo')
  @ApiOperation({
    summary: '채팅방 입장시 대화내역 API',
    description: '채팅방 입장 시 가장 최신 대화내역 출력',
  })
  async getRecentChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
  ): Promise<object> {
    const response = await this.chatControllerService.getRecentChatLog({
      userNo,
      chatRoomNo,
    });

    return { response };
  }

  // @Post('/create/:meetingNo/:hostNo')
  // async createChatRoom(
  //   @Param('meetingNo', ParseIntPipe) meetingNo: number,
  //   @Param('hostNo', ParseIntPipe) hostNo: number,
  //   @Body() meetingMembersList: MeetingMembersList,
  // ) {
  //
  //     await this.chatControllerService.createChatRoom(
  //       meetingNo,
  //       hostNo,
  //       meetingMembersList,
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Get('/:chatRoomNo/log')
  @ApiOperation({
    summary: '채팅 내역 API',
    description: ' 채팅 내역 조회',
  })
  async getChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
    @Body('currentChatLogNo', ParseIntPipe) currentChatLogNo: number,
  ): Promise<object> {
    const response = await this.chatControllerService.getChatLog({
      userNo,
      chatRoomNo,
      currentChatLogNo,
    });

    return { response };
  }

  @Post('/:chatRoomNo/invite')
  @ApiOperation({
    summary: '채팅방 초대 API',
    description: '알람을 통해 채팅방 초대',
  })
  async inviteUser(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
    @Body('targetUserNo', ParseIntPipe) targetUserNo: number,
  ): Promise<object> {
    await this.chatControllerService.inviteUser(
      userNo,
      targetUserNo,
      chatRoomNo,
    );

    return {
      msg: '초대 성공',
    };
  }

  @Post('/accept/:noticeNo')
  @ApiOperation({
    summary: '채팅방 초대 수락 API',
    description: 'notice 번호를 통한 초대 수락',
  })
  async acceptInvitation(
    @Param('noticeNo', ParseIntPipe) noticeNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
  ) {
    await this.chatControllerService.acceptInvitation(noticeNo, userNo);

    return {
      msg: '채팅방 참여 성공',
    };
  }
}
