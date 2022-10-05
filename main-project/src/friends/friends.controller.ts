import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('친구 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Patch('/accept/:userNo')
  @ApiOperation({
    summary: '친구  요청 수락 API',
    description: '토큰의 userNo와 body로 받은 senderNo',
  })
  async acceptFriend(
    @Param('userNo', ParseIntPipe) receiverNo: number,
    @Body('senderNo', ParseIntPipe) senderNo: number,
  ): Promise<object> {
    try {
      const friendAccept = await this.friendsService.acceptFriendRequest(
        receiverNo,
        senderNo,
      );
      return friendAccept;
    } catch (err) {
      throw err;
    }
  }

  @Get('/request/receive/:userNo')
  @ApiOperation({
    summary: '받은 친구 신청 목록 조회 API',
    description: '유저가 받은 친구 신청 전체 조회',
  })
  async getReceiveFriendRequest(
    @Param('userNo', ParseIntPipe) receiverNo: number,
  ): Promise<object> {
    try {
      const friendRequestList = await this.friendsService.getFriendRequest(
        receiverNo,
      );

      return friendRequestList;
    } catch (err) {
      throw err;
    }
  }
  @Get('/request/send/:userNo')
  @ApiOperation({
    summary: '보낸 친구 신청 목록 조회 API',
    description: '유저가 보낸 친구 신청 전체조회',
  })
  async getSendedFriendRequest(
    @Param('userNo', ParseIntPipe) senderNo: number,
  ): Promise<object> {
    try {
      const friendRequestList =
        await this.friendsService.getSendedFriendRequest(senderNo);

      return friendRequestList;
    } catch (err) {
      throw err;
    }
  }

  @Post('/request')
  @ApiOperation({
    summary: '친구 신청 API',
    description: '친구 신청 API',
  })
  async createFriendRequest(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<object> {
    try {
      const sendRequest = await this.friendsService.createFriendRequest(
        createFriendDto,
      );

      return sendRequest;
    } catch (err) {
      throw err;
    }
  }
}
