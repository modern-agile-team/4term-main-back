import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';
import { MannerChatUserInfo } from './interface/manner.interface';
import { MannersRepository } from './repository/manners.repository';
import { MannersLogRepository } from './repository/mannersLog.repository';

@Injectable()
export class MannersService {
  constructor(
    @InjectRepository(MannersRepository)
    private readonly mannersRepository: MannersRepository,
    private readonly mannerLogRepository: MannersLogRepository,
    private readonly chatListRepository: ChatListRepository,
    private readonly chatUsersRepository: ChatUsersRepository,
  ) {}

  async giveScore(boardNo: number, userNo: number): Promise<any> {
    const checkUserType = {
      host: 0,
      guest: 1,
    };
    const chatRoomNo = await this.getChatRoomNoByBoardNo(boardNo);

    const userType = await this.getUserTypeByUserNo({ chatRoomNo, userNo });

    if (userType === checkUserType.host) {
      return this.getTargetUserChatRoomNo(chatRoomNo, checkUserType.guest);
    }
    if (userType === checkUserType.guest) {
      return this.getTargetUserChatRoomNo(chatRoomNo, checkUserType.host);
    }
  }

  private async getChatRoomNoByBoardNo(boardNo: number): Promise<any> {
    const { chatRoomNo } = await this.chatListRepository.getChatRoomNoByBoardNo(
      boardNo,
    );
    if (!chatRoomNo) {
      throw new NotFoundException(`존재하지 않는 채팅방입니다.`);
    }

    return chatRoomNo;
  }

  private async getTargetUserChatRoomNo(
    chatRoomNo: number,
    userType: number,
  ): Promise<void> {
    await this.chatUsersRepository.getTargetUserChatRoomNo(
      chatRoomNo,
      userType,
    );
  }

  private async getUserTypeByUserNo(
    chatUserInfo: MannerChatUserInfo,
  ): Promise<number> {
    const { userType } = await this.chatUsersRepository.getUserTypeByUserNo(
      chatUserInfo,
    );
    return userType;
  }

  private async;
}
