import { Controller, Get, Param } from '@nestjs/common';
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
}
