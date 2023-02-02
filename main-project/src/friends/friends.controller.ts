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
    const friendList = await this.friendsService.getFriendList(userNo);

    return { response: { friendList } };
  }

  @Post('/request')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '친구 신청 API',
    description: '친구 신청 API',
  })
  async sendFriendRequest(
    @GetUser() userNo,
    @TransactionDecorator() manager: EntityManager,
    @Body() createFriendDto: CreateFriendRequestDto,
  ): Promise<APIResponse> {
    await this.friendsService.createFriendRequest(
      userNo,
      manager,
      createFriendDto,
    );

    return {
      msg: '친구 신청이 완료되었습니다.',
    };
  }

  @Patch('/accept')
  @ApiOperation({
    summary: '친구  요청 수락 API',
    description: '토큰의 userNo와 body로 받은 senderNo',
  })
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(
    @GetUser() userNo: number,
    @Body() friendRequest: FriendRequestDto,
  ): Promise<APIResponse> {
    await this.friendsService.acceptFriendRequest(userNo, friendRequest);

    return {
      msg: '친구 신청을 수락했습니다.',
    };
  }

  @Get('/request/received')
  @ApiOperation({
    summary: '받은 친구 신청 목록 조회 API',
    description: '유저가 받은 친구 신청 전체 조회',
  })
  @UseGuards(JwtAuthGuard)
  async getAllReceiveFriendRequest(
    @GetUser('userNo') receiverNo: number,
  ): Promise<APIResponse> {
    const receivedRequestList =
      await this.friendsService.getAllReceivedFriendRequest(receiverNo);

    return { response: { receivedRequestList } };
  }

  @Get('/request/send')
  @ApiOperation({
    summary: '보낸 친구 신청 목록 조회 API',
    description: '유저가 보낸 친구 신청 전체조회',
  })
  @UseGuards(JwtAuthGuard)
  async getAllSendFriendRequest(
    @GetUser('userNo') senderNo: number,
  ): Promise<APIResponse> {
    const sendedRequestList =
      await this.friendsService.getAllSendedFriendRequest(senderNo);

    return { response: { sendedRequestList } };
  }

  @Delete('/request/refuse/:userNo')
  @ApiOperation({
    summary: '친구 신청 거절 API',
    description: '친구 신청 거절 API',
  })
  @UseGuards(JwtAuthGuard)
  async refuseRequest(
    @GetUser('userNo') receiverNo: number,
    @Body() friendRequest: FriendRequestDto,
  ): Promise<APIResponse> {
    await this.friendsService.refuseRequest({ receiverNo, ...friendRequest });

    return {
      msg: '친구 요청을 거절했습니다.',
    };
  }

  // 추후 토큰의 유저no와 friendNo 확인 후 삭제
  @Delete('/delete/:userNo')
  @ApiOperation({
    summary: '친구 삭제 API',
    description: '친구 삭제 API',
  })
  @UseGuards(JwtAuthGuard)
  async deleteFriend(
    @GetUser() userNo: number,
    @Body() deleteFriendDto: DeleteFriendDto,
  ): Promise<APIResponse> {
    await this.friendsService.deleteFriend({ userNo, ...deleteFriendDto });

    return {
      msg: '친구삭제가 완료되었습니다.',
    };
  }

  @Get('/search/:nickname')
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
