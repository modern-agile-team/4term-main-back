import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { threadId } from 'worker_threads';
import { MannerDto } from './dto/createManners.dto';
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
    private readonly meetingsRepository: MeetingRepository,
    private readonly noticesRepository: NoticesRepository,
  ) {}
  // 유저평점 가져오는 기능(미팅용)
  async getScore(meetingNo: number, userNo: number): Promise<number> {
    await this.getChatRoomNoByMeetingNo(meetingNo);
    const getGrade = await this.getGradeByUserNo(userNo);

    return getGrade;
  }

  private async getChatRoomNoByMeetingNo(meetingNo: number): Promise<number> {
    const chatRoom = await this.meetingsRepository.getChatRoomNoByMeetingNo(
      meetingNo,
    );
    if (!chatRoom) {
      throw new NotFoundException(`존재하지 않는 채팅방입니다.`);
    }

    return chatRoom;
  }

  private async getGradeByUserNo(userNo: number): Promise<number> {
    const getUserGrade = await this.mannersRepository.getGradeByUserNo(userNo);

    if (!getUserGrade) {
      throw new BadRequestException('채팅방에 없는 유저입니다.');
    }
    return getUserGrade;
  }
  // 평점 계산하는 로직(원래 평점 + 부여받은 평점)

  //매너 평점 가져오기
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
  // 게시글 있나 없나 확인
  // user, targetUser 있나 확인, type 확인
  // 같은 게시글에서 만남 확인
  async giveScore(mannerInfo: MannerDto): Promise<void> {
    const affected = await this.mannersLogRepository.giveScore(mannerInfo);

    // 수정해야 될 것 +
    if (!affected) {
      throw new BadRequestException('이미 평점을 준 유저 입니다.');
    }
    return;
  }

  /*
  만남 성사 -> 최종 만남 시간이 됐다(채팅방에서 생긴 미팅) -> 매너로그 생성(깡통)
  */

  //매너로그 update
  async updateMannerLog(
    chatRoomNo: number,
    mannerLog: MannerDto,
  ): Promise<void> {
    const userArr = await this.userInfoByChatRoomNo(chatRoomNo);

    await this.mannersLogRepository.updateMannerLog(mannerLog);
  }

  // 해당채팅방의 userNo와 guest를(user_type)파악하고 배열로 만듦
  private async userInfoByChatRoomNo(chatRoomNo: number) {
    const userInfo = await this.chatUsersRepository.userInfoByChatRoomNo(
      chatRoomNo,
    );

    if (!userInfo) {
      throw new NotFoundException('user 정보를 가져오지 못했습니다');
    }

    const host = userInfo[0].userNo.split(',').map((el) => {
      return parseInt(el);
    });
    const guest = userInfo[1].userNo.split(',').map((el) => {
      return parseInt(el);
    });

    return [host, guest];
  }
  // 알람 + 깡통
  async createMannerNotice(chatRoomNo: number) {
    const userList = await this.userInfoByChatRoomNo(chatRoomNo);

    const host = userList[0];
    const guest = userList[1];

    const arr = await this.setNotice(host, guest);
    await this.noticesRepository.saveNotice(arr);
  }

  private async setNotice(host, guest) {
    const arr = [];

    for (let idx in host) {
      for (let i = 0; i < guest.length; i++) {
        arr.push({
          userNo: guest[i],
          targetUserNo: host[idx],
          type: NoticeType.GIVE_SCORE,
        });

        arr.push({
          userNo: host[idx],
          targetUserNo: guest[i],
          type: NoticeType.GIVE_SCORE,
        });
      }
    }

    // const test = await this.noticesRepository.saveNotice(arr);
    return arr;
  }

  // manner 수정
  async updateManner(userNo: number) {}
}
