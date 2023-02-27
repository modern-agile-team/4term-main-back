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
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { APIResponse } from 'src/common/interface/interface';
import { SearchedUser } from 'src/users/interface/user.interface';
import { EntityManager } from 'typeorm';
import { FriendsService } from './friends.service';
import {
  ReceivedFriendRequest,
  SentFriendRequest,
} from './interface/friend.interface';
import { ApiAcceptFriendRequest } from './swagger/accept-friend-request.decorator';
import { ApiDeleteFriend } from './swagger/delete-friend.decorator';
import { ApiGetFriends } from './swagger/get-friends.decorator';
import { ApiGetReceivedRequests } from './swagger/get-received-requests.decorator';
import { ApiGetSentRequests } from './swagger/get-sent-requests.decorator';
import { ApiRefuseRequests } from './swagger/refuse-request.decorator';
import { ApiSearchFriends } from './swagger/search-friends.decorator';
import { ApiSearchNotFriendUsers } from './swagger/search-not-friends.decorator';
import { ApiSendFriendRequest } from './swagger/send-friend-request.decorator';
import { ApiValidateFriend } from './swagger/validate-friend.decorator';

@Controller('friends')
@ApiTags('친구 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiGetFriends()
  @UseGuards(JwtAuthGuard)
  async getFriendList(@GetUser() userNo: number): Promise<APIResponse> {
    const friends = await this.friendsService.getFriends(userNo);

    return { response: { friends } };
  }

  @Get('/requests/received')
  @ApiGetReceivedRequests()
  @UseGuards(JwtAuthGuard)
  async getReceivedRequests(
    @GetUser('userNo') receiverNo: number,
  ): Promise<APIResponse> {
    const receivedRequests: ReceivedFriendRequest[] =
      await this.friendsService.getReceivedRequests(receiverNo);

    return { response: { receivedRequests } };
  }

  @Get('/requests/sent')
  @ApiGetSentRequests()
  @UseGuards(JwtAuthGuard)
  async getSentRequests(
    @GetUser('userNo') senderNo: number,
  ): Promise<APIResponse> {
    const sentFriendRequests: SentFriendRequest[] =
      await this.friendsService.getSentRequests(senderNo);

    return { response: { sentFriendRequests } };
  }

  @Post('/requests/:receiverNo')
  @ApiSendFriendRequest()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  async sendFriendRequest(
    @GetUser() userNo,
    @TransactionDecorator() manager: EntityManager,
    @Param('receiverNo', ParseIntPipe) receiverNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.sendFriendRequest(userNo, manager, receiverNo);

    return {
      msg: '친구 신청이 완료되었습니다.',
    };
  }

  @Patch('/requests/:friendNo/:senderNo')
  @ApiAcceptFriendRequest()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  async acceptFriendRequest(
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Param('friendNo', ParseIntPipe) friendNo: number,
    @Param('senderNo', ParseIntPipe) senderNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.acceptFriendRequest(
      userNo,
      manager,
      friendNo,
      senderNo,
    );

    return {
      msg: '친구 신청을 수락했습니다.',
    };
  }

  @Delete('/requests/:friendNo/:senderNo')
  @ApiRefuseRequests()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  async refuseRequest(
    @GetUser('userNo') receiverNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Param('friendNo', ParseIntPipe) friendNo: number,
    @Param('senderNo', ParseIntPipe) senderNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.refuseRequest(manager, {
      receiverNo,
      friendNo,
      senderNo,
    });

    return {
      msg: '친구 신청을 거절했습니다.',
    };
  }

  @Delete('/:friendNo/:friendUserNo')
  @ApiDeleteFriend()
  @UseGuards(JwtAuthGuard)
  async deleteFriend(
    @GetUser() userNo: number,
    @Param('friendNo', ParseIntPipe) friendNo: number,
    @Param('friendUserNo', ParseIntPipe) friendUserNo: number,
  ): Promise<APIResponse> {
    await this.friendsService.deleteFriend(userNo, friendNo, friendUserNo);

    return {
      msg: '친구 삭제가 완료되었습니다.',
    };
  }

  @Get('/:nickname')
  @ApiSearchFriends()
  @UseGuards(JwtAuthGuard)
  async searchFriends(
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

  @Get('/not-friends/:nickname')
  @ApiSearchNotFriendUsers()
  @UseGuards(JwtAuthGuard)
  async searchNotFriendUsers(
    @GetUser('userNo', ParseIntPipe) userNo: number,
    @Param('nickname') nickname: string,
  ): Promise<APIResponse> {
    const searchResult: SearchedUser[] =
      await this.friendsService.searchNotFriendUsers(userNo, nickname);
    return { response: { searchResult } };
  }

  @Get('/validate/:friendUserNo')
  @ApiValidateFriend()
  @UseGuards(JwtAuthGuard)
  async isFriend(
    @GetUser('userNo') myUserNo: number,
    @Param('friendUserNo', ParseIntPipe) friendUserNo: number,
  ): Promise<APIResponse> {
    const isFriend: Boolean = await this.friendsService.isFriend(
      myUserNo,
      friendUserNo,
    );

    return {
      response: { isFriend },
    };
  }
}
