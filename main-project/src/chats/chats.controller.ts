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
import { ConnectedSocket } from '@nestjs/websockets/decorators';
import { Socket } from 'dgram';

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
  async getChatRoomList(@Param('userNo') userNo: number): Promise<object> {
    const response = await this.chatControllerService.getChatRoomListByUserNo(
      userNo,
    );
    return {
      response,
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
  ): Promise<object> {
    const previousChatLog = await this.chatControllerService.getPreviousChatLog(
      getChatLogDto,
      chatRoomNo,
    );

    return { response: { previousChatLog } };
  }

  @Post('/:chatRoomNo/invite')
  @ApiOperation({
    summary: '채팅방 초대 API',
    description: '알람을 통해 채팅방 초대',
  })
  async inviteUser(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @Body() inviteUser: InviteUserDTO,
  ): Promise<object> {
    await this.chatControllerService.inviteUser(inviteUser, chatRoomNo);

    return {
      msg: '초대 성공',
    };
  }

  @Post('/:chatRoomNo/images')
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async uploadFile(
    @Param('chatRoomNo', ParseIntPipe) chatRoomNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedFileUrlList =
      files.length === 0
        ? false
        : await this.awsService.uploadImage(files, chatRoomNo);

    return {
      msg: `이미지 업로드 성공`,
      response: { uploadedFileUrlList },
    };
  }

  @Post('/error')
  err(@Body('no') no: number) {
    throw new BadRequestException('에러');
  }
}
