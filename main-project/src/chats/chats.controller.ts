import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsControllerService } from './chats-controller.service';
import { AwsService } from 'src/aws/aws.service';
import { ChatLog } from './entity/chat-log.entity';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { APIResponse } from 'src/common/interface/interface';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { UseGuards } from '@nestjs/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ApiGetPreviousChatLog } from './swagger/get-previous-chat-log.decorator';
import { ApiGetCurrentChatLog } from './swagger/get-current-chat-log.decorator';
import { ApiInviteUser } from './swagger/invite-user.decorator';
import { ApiAcceptInvitation } from './swagger/accept-invitation.decorator';

@Controller('chats')
@ApiTags('채팅 APi')
export class ChatsController {
  constructor(
    private readonly chatControllerService: ChatsControllerService,
    private readonly awsService: AwsService,
  ) {}

  @Get('/:chatRoomNo/chat-log/:currentChatLogNo')
  @ApiGetPreviousChatLog()
  @UseGuards(JwtAuthGuard)
  async getPreviousChatLog(
    @GetUser() userNo: number,
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Param('currentChatLogNo', ParseIntPipe) currentChatLogNo: number,
  ): Promise<APIResponse> {
    const previousChatLog: ChatLog[] =
      await this.chatControllerService.getPreviousChatLog(
        userNo,
        chatRoomNo,
        currentChatLogNo,
      );

    return { response: { previousChatLog } };
  }

  @Get('/:chatRoomNo/chat-log')
  @ApiGetCurrentChatLog()
  @UseGuards(JwtAuthGuard)
  async getCurrentChatLog(
    @GetUser() userNo: number,
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
  ): Promise<APIResponse> {
    const currentChatLog: ChatLog[] =
      await this.chatControllerService.getCurrentChatLog(userNo, chatRoomNo);

    return { response: { currentChatLog } };
  }

  @Post('/:chatRoomNo/invitation/:userNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiInviteUser()
  async inviteUser(
    @GetUser() targetUserNo: number,
    @TransactionDecorator() manager: EntityManager,
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Param('userNo', ParseIntPipe) userNo: number,
  ): Promise<APIResponse> {
    await this.chatControllerService.inviteUser(
      userNo,
      manager,
      targetUserNo,
      chatRoomNo,
    );

    return {
      msg: '채팅방 초대 성공',
    };
  }

  @Patch('/:chatRoomNo/invitation')
  @ApiAcceptInvitation()
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @GetUser() userNo: number,
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body() invitation: AcceptInvitationDto,
  ): Promise<APIResponse> {
    await this.chatControllerService.acceptInvitation(
      userNo,
      chatRoomNo,
      invitation,
    );

    return {
      msg: '채팅방 초대 수락 성공',
    };
  }

  @Post('/:chatRoomNo/files')
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
