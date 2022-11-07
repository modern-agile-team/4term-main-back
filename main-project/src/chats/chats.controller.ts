import { Body, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsControllerService } from './chats-controller.service';

@Controller('chats')
@ApiTags('채팅 APi')
export class ChatsController {
  constructor(private readonly chatControllerService: ChatsControllerService) {}

  @Get('/chatroom/:userNo')
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
    } catch (err) {
      throw err;
    }
  }

  @Get('/chatRoom/:chatRoomNo/log')
  async getChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body('userNo', ParseIntPipe) userNo: number,
    @Body('currentChatLogNo', ParseIntPipe) currentChatLogNo: number,
  ): Promise<any> {
    try {
      const chatLog = await this.chatControllerService.getChatLog({
        userNo,
        chatRoomNo,
        currentChatLogNo,
      });

      return chatLog;
    } catch (err) {
      throw err;
    }
  }
}
