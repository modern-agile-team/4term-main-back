import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { APIResponse } from 'src/common/interface/interface';
import { EntityManager } from 'typeorm';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { FriendRequestDto } from './dto/friend-request.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('친구 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({
    summary: '친구 목록 API',
    description: '친구 목록 조회',
  })
  @UseGuards(JwtAuthGuard)
  async getFriendList(@GetUser() userNo: number): Promise<APIResponse> {
    const friends = await this.friendsService.getFriends(userNo);

    return { response: { friends } };
  }

  @Post('/requests/:receiverNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '친구 신청 API',
    description: '친구 신청 API',
  })
  async sendFriendRequest(
    @GetUser() userNo,
    @TransactionDecorator() manager: EntityManager,
    @Param('receiverNo') receiverNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.sendFriendRequest(userNo, manager, receiverNo);

    return {
      msg: '친구 신청이 완료되었습니다.',
    };
  }

  @Patch('/requests/:friendNo/:senderNo')
  @ApiOperation({
    summary: '친구  요청 수락 API',
    description: '토큰의 userNo와 Param으로 받은 friendNo,senderNo',
  })
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(
    @GetUser() userNo: number,
    @Param('friendNo', ParseIntPipe) friendNo: number,
    @Param('senderNo', ParseIntPipe) senderNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.acceptFriendRequest(userNo, friendNo, senderNo);

    return {
      msg: '친구 신청을 수락했습니다.',
    };
  }

  @Get('/requests/received')
  @ApiOperation({
    summary: '받은 친구 신청 목록 조회 API',
    description: '유저가 받은 친구 신청 전체 조회',
  })
  @UseGuards(JwtAuthGuard)
  async getReceiveFriendRequest(
    @GetUser('userNo') receiverNo: number,
  ): Promise<APIResponse> {
    const receivedRequests = await this.friendsService.getReceivedFriendRequest(
      receiverNo,
    );

    return { response: { receivedRequests } };
  }

  @Get('/requests/sent')
  @ApiOperation({
    summary: '보낸 친구 신청 목록 조회 API',
    description: '유저가 보낸 친구 신청 전체조회',
  })
  @UseGuards(JwtAuthGuard)
  async getSentFriendRequests(
    @GetUser('userNo') senderNo: number,
  ): Promise<APIResponse> {
    const sentFriendRequests = await this.friendsService.getSentFriendRequests(
      senderNo,
    );

    return { response: { sentFriendRequests } };
  }

  @Delete('/request/:friendNo/:senderNo')
  @ApiOperation({
    summary: '친구 신청 거절 API',
    description: '친구 신청 거절 API',
  })
  @UseGuards(JwtAuthGuard)
  async refuseRequest(
    @GetUser('userNo') receiverNo: number,
    @Param('friendNo') friendNo: number,
    @Param('senderNo') senderNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.refuseRequest({
      receiverNo,
      friendNo,
      senderNo,
    });

    return {
      msg: '친구 요청을 거절했습니다.',
    };
  }

  @Delete('/:friendNo/:friendUserNo')
  @ApiOperation({
    summary: '친구 삭제 API',
    description: '친구 삭제 API',
  })
  @UseGuards(JwtAuthGuard)
  async deleteFriend(
    @GetUser() userNo: number,
    @Param('friendNo') friendNo: number,
    @Param('friendUserNo') friendUserNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.deleteFriend(userNo, friendNo, friendUserNo);

    return {
      msg: '친구삭제가 완료되었습니다.',
    };
  }

  @Get('/:nickname')
  @ApiOperation({
    summary: '친구 검색 API',
    description: '닉네임으로 친구 검색',
  })
  @UseGuards(JwtAuthGuard)
  async searchFriend(
    @GetUser() userNo: number,
    @Param('nickname') nickname: string,
  ): Promise<APIResponse> {
    const searchResult = await this.friendsService.searchFriend(
      nickname,
      userNo,
    );

    return {
      response: { searchResult },
    };
  }
}
