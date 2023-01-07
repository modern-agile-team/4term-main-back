import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsControllerService } from './chats-controller.service';
import { GetChatLogDTO } from './dto/get-chat-log.dto';
import { InviteUserDTO } from './dto/invite-user.dto';
import { AwsService } from 'src/aws/aws.service';
import { ChatLog } from './entity/chat-log.entity';
import { AcceptInvitationDTO } from './dto/accept-invitation.dto';
import { APIResponse } from 'src/common/interface/interface';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';

@Controller('chats')
@ApiTags('채팅 APi')
export class ChatsController {
  constructor(
    private readonly chatControllerService: ChatsControllerService,
    private readonly awsService: AwsService,
  ) {}

  @Get('/:userNo')
  @ApiOperation({
    summary: '채팅 목록 API',
    description: ' 채팅 목록 조회',
  })
  async getChatRoomList(@Param('userNo') userNo: number): Promise<APIResponse> {
    const chatRoom = await this.chatControllerService.getChatRoomListByUserNo(
      userNo,
    );
    return {
      response: { chatRoom },
    };
  }

  @Get('/:chatRoomNo/log')
  @ApiOperation({
    summary: '이전 채팅 내역 API',
    description: '이전 채팅 내역 조회',
  })
  async getChatLog(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body() getChatLogDto: GetChatLogDTO,
  ): Promise<APIResponse> {
    const previousChatLog: ChatLog[] =
      await this.chatControllerService.getPreviousChatLog(
        getChatLogDto,
        chatRoomNo,
      );

    return { response: { previousChatLog } };
  }

  @Post('/:chatRoomNo/invitation')
  @ApiOperation({
    summary: '채팅방 초대 API',
    description: '알람을 통해 채팅방 초대',
  })
  @UseInterceptors(TransactionInterceptor)
  async inviteUser(
    @TransactionDecorator() manager: EntityManager,
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body() inviteUser: InviteUserDTO,
  ): Promise<APIResponse> {
    await this.chatControllerService.inviteUser(
      manager,
      inviteUser,
      chatRoomNo,
    );

    return {
      msg: '채팅방 초대 성공',
    };
  }

  @Post('/:chatRoomNo/invitation/accept')
  @ApiOperation({
    summary: '채팅방 초대 수락 API',
    description: '유저 번호, 타입, 채팅방 번호를 통해 초대 수락',
  })
  async acceptInvitation(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body() invitationInfo: AcceptInvitationDTO,
  ): Promise<APIResponse> {
    await this.chatControllerService.acceptInvitation(
      chatRoomNo,
      invitationInfo,
    );

    return {
      msg: '채팅방 초대 수락 성공',
    };
  }

  @Post('/:chatRoomNo/upload/files')
  @ApiOperation({
    summary: '파일 전송 API',
    description:
      'files에 담긴 최대 10개의 파일을 전달받아 s3업로드 후 url배열 반환',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async uploadFile(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    const uploadedFileUrlList = await this.awsService.uploadChatFiles(
      files,
      chatRoomNo,
    );

    return {
      msg: `파일 업로드 성공`,
      response: { uploadedFileUrlList },
    };
  }
}
