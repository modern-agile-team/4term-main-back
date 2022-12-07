import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';
import { MannerDto } from './dto/createManners.dto';
import { MannerChatUserInfo, UserNo } from './interface/manner.interface';
import { MannersRepository } from './repository/manners.repository';
import { MannersLogRepository } from './repository/mannersLog.repository';

@Injectable()
export class MannersService {
  constructor(
    @InjectRepository(MannersRepository)
    private readonly mannersRepository: MannersRepository,
    private readonly mannersLogRepository: MannersLogRepository,
    private readonly chatListRepository: ChatListRepository,
    private readonly chatUsersRepository: ChatUsersRepository,
  ) {}

  async getScore(boardNo: number, userNo: number): Promise<number[]> {
    const chatRoomNo = await this.getChatRoomNoByBoardNo(boardNo);

    await this.getUserTypeByUserNo({ chatRoomNo, userNo });

    const targetUserGrade = await this.getGradeByUserNo(userNo);
    return targetUserGrade;
  }
  // boardNo를 이용 채팅방 찾는 기능
  private async getChatRoomNoByBoardNo(boardNo: number): Promise<number> {
    const { chatRoomNo } = await this.chatListRepository.getChatRoomNoByBoardNo(
      boardNo,
    );
    if (!chatRoomNo) {
      throw new NotFoundException(`존재하지 않는 채팅방입니다.`);
    }

    return chatRoomNo;
  }
  // chatRoomNo를 이용해서 상대유저 찾기
  private async getTargetUserByChatRoomNo(
    chatRoomNo: number,
    userType: number,
  ): Promise<number[]> {
    const { userNo } = await this.chatUsersRepository.getTargetUserByChatRoomNo(
      chatRoomNo,
      userType,
    );
    const arrUserNo: number[] = userNo.split(',').map((el) => {
      return parseInt(el);
    });

    return arrUserNo;
  }
  //userNo를 이용 userType 찾기
  private async getUserTypeByUserNo(
    chatUserInfo: MannerChatUserInfo,
  ): Promise<number> {
    const { userType } = await this.chatUsersRepository.getUserTypeByUserNo(
      chatUserInfo,
    );
    return userType;
  }
  //userNo이용 grade 받아옴
  private async getGradeByUserNo(userNo: number): Promise<number[]> {
    const getUserGrade = await this.mannersRepository.getGradeByUserNo(userNo);

    if (!userNo) {
      throw new BadRequestException('채팅방에 없는 유저입니다.');
    }
    return getUserGrade;
  }
  //프로필 상에서 보이는 grade
  async userGradebyUserProfileNo(userProfileNo: number): Promise<number> {
    const userGrade = await this.mannersRepository.userGradebyUserProfileNo(
      userProfileNo,
    );
    if (!userGrade) {
      throw new BadRequestException('유저 평점 가져오기에 실패하였습니다');
    }

    return userGrade;
  }
  //평점주기
  async giveScore(mannerInfo: MannerDto) {
    const give = await this.mannersLogRepository.giveScore(mannerInfo);
  }
}
