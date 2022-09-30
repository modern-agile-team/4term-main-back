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
    summary: '친구요청 수락 API',
    description: '토큰의 userNo와 body로 받은 requestUserNo',
  })
  async acceptFriend(
    @Param('userNo', ParseIntPipe) userNo: number,
    @Body('requestUserNo', ParseIntPipe) friendNo: number,
  ): Promise<void> {
    try {
      await this.friendsService.acceptFriendRequest(userNo, friendNo);
    } catch (err) {
      throw err;
    }
  }

  @Get('/request/:userNo')
  @ApiOperation({
    summary: '친구 신청 목록 조회 API',
    description: '유저가 받은 친구 신청 전체조회',
  })
  async getFriendRequest(
    @Param('userNo', ParseIntPipe) userNo: number,
  ): Promise<object> {
    try {
      const friendRequestList = await this.friendsService.getFriendRequest(
        userNo,
      );

      return {
        friendRequestList,
      };
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
      await this.friendsService.createFriendRequest(createFriendDto);

      return {
        success: true,
        msg: '친구신청이 완료 되었습니다.',
      };
    } catch (err) {
      throw err;
    }
  }
}
