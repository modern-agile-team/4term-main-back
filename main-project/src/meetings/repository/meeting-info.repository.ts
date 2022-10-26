import { InternalServerErrorException } from '@nestjs/common';
import { ChatRoom } from 'src/chats/interface/chat.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { MeetingMemberDetail } from '../interface/meeting.interface';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {
  async createMeetingInfo(meetingInfo: MeetingMemberDetail): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'meeting_info',
      )
        .insert()
        .into(MeetingInfo)
        .values(meetingInfo)
        .execute();

      return raw.affectedRows;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 데이터 생성(createMeetingInfo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async saveMeetingGuest(guest: number, meetingNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder(
        'meeting_info',
      )
        .update()
        .set({ guest })
        .where('meetingNo = :meetingNo', { meetingNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 게스트 추가(saveMeetingGuest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingInfoById(meetingNo: number): Promise<any> {
    try {
      const meetingInfo = await this.createQueryBuilder('meeting_info')
        .select([
          'meeting_info.host AS adminHost',
          'meeting_info.guest AS adminGuest',
          'meeting_info.guestHeadcount AS guestHeadcount',
          'meeting_info.hostHeadcount AS hostHeadcount',
        ])
        .where('meeting_info.meetingNo = :meetingNo', { meetingNo })
        .getRawOne();

      return meetingInfo;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 상세 조회(getMeetingInfoById): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingUser(meetingNo): Promise<ChatRoom> {
    try {
      const nickname = await this.createQueryBuilder('meeting_info')
        .leftJoin('meeting_info.meetingNo', 'meetingNo')
        .leftJoin('meetingNo.hostMembers', 'hostMembers')
        .leftJoin('hostMembers.userNo', 'hostUserNo')
        .leftJoin('meetingNo.guestMembers', 'guestMembers')
        .leftJoin('guestMembers.userNo', 'guestUserNo')
        .select([
          'GROUP_CONCAT(DISTINCT guestUserNo.nickname) AS guestUserNickname',
          'GROUP_CONCAT(DISTINCT hostUserNo.nickname) AS hostUserNickname',
          'GROUP_CONCAT(DISTINCT hostMembers.user_no) AS hostUserNo',
          'GROUP_CONCAT(DISTINCT guestMembers.user_no) AS guestUserNo',
        ])
        .where('meeting_info.meetingNo = :meetingNo', { meetingNo })
        .getRawOne();

      return nickname;
    } catch (err) {
      throw err;
    }
  }
}
