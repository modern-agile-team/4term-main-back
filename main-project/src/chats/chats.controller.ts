import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsControllerService } from './chats-controller.service';
import { ChatLog } from './entity/chat-log.entity';
import { MeetingMembersList } from './interface/chat.interface';

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
    try {
      const chatRoomList =
        await this.chatControllerService.getChatRoomListByUserNo(userNo);
      return {
        success: true,
        chatRoomList,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/join/:chatRoomNo')
  @ApiOperation({
    summary: '채팅방 입장시 대화내역 API',
    description: '채팅방 입장 시 가장 최신 대화내역 출력',
  })
  async getRecentChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
  ): Promise<any> {
    try {
      const chatLog = await this.chatControllerService.getRecentChatLog({
        userNo,
        chatRoomNo,
      });

      return chatLog;
    } catch (error) {
      throw error;
    }
  }

  // @Post('/create/:meetingNo/:hostNo')
  // async createChatRoom(
  //   @Param('meetingNo', ParseIntPipe) meetingNo: number,
  //   @Param('hostNo', ParseIntPipe) hostNo: number,
  //   @Body() meetingMembersList: MeetingMembersList,
  // ) {
  //   try {
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
  async getChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
    @Body('currentChatLogNo', ParseIntPipe) currentChatLogNo: number,
  ): Promise<ChatLog[]> {
    try {
      const chatLog = await this.chatControllerService.getChatLog({
        userNo,
        chatRoomNo,
        currentChatLogNo,
      });

      return chatLog;
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:chatRoomNo/invite')
  async inviteUser(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
    @Body('targetUserNo', ParseIntPipe) targetUserNo: number,
  ): Promise<any> {
    try {
      await this.chatControllerService.inviteUser(
        userNo,
        targetUserNo,
        chatRoomNo,
      );

      return {
        success: true,
        msg: '초대 성공',
      };
    } catch (error) {
      throw error;
    }
  }
}
