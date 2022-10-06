import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { FriendsService } from './friends.service';
import { Friend } from './interface/friend.interface';

@Controller('friends')
@ApiTags('친구 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('/:userNo')
  @ApiOperation({
    summary: '친구 목록 APi',
    description: '친구 목록 조회',
  })
  async getFriendList(@Param('userNo') userNo: Friend): Promise<Friend> {
    const friendList = await this.friendsService.getFriendList(userNo);
    return friendList;
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
      const friendRequestList =
        await this.friendsService.getAllReceiveFriendRequest(receiverNo);

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
      const friendRequestList = await this.friendsService.getSendFriendRequest(
        senderNo,
      );

      return friendRequestList;
    } catch (err) {
      throw err;
    }
  }

  // 추후 토큰의 유저no와 friendNo 확인 후 삭제
  @Delete('/delete')
  @ApiOperation({
    summary: '친구 삭제 API',
    description: '친구 삭제 API',
  })
  async deleteFriend(
    @Body() deleteFriendDto: DeleteFriendDto,
  ): Promise<object> {
    try {
      const deleteFriend = await this.friendsService.deleteFriend(
        deleteFriendDto,
      );
      return deleteFriend;
    } catch (err) {
      throw err;
    }
  }
}
