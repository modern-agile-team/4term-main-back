import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Meetings } from '../entity/meeting.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  InsertRaw,
  Meeting,
  MeetingGuests,
  MeetingHosts,
  UpdatedMeeting,
} from '../interface/meeting.interface';
import { UserType } from 'src/common/configs/user-type.config';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async createMeeting(meeting: Meeting): Promise<InsertRaw> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('meetings')
        .insert()
        .into(Meetings)
        .values(meeting)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 생성 에러(createMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async findMeetingById(meetingNo: number): Promise<Meetings> {
    try {
      const meeting: Meetings = await this.createQueryBuilder('meetings')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getOne();

      return meeting;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 조회 에러(findMeetingById): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async findMeetingByChatRoom(chatRoomNo: number): Promise<Meetings> {
    try {
      const meeting: Meetings = await this.createQueryBuilder('meetings')
        .where('meetings.chatRoomNo = :chatRoomNo', { chatRoomNo })
        .getOne();

      return meeting;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 조회 에러(findMeetingByChatRoom): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingHosts(meetingNo: number): Promise<MeetingHosts> {
    try {
      const meetingHosts: MeetingHosts = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin('meetings.chatRoomNo', 'chatList')
        .leftJoin('chatList.chatUserNo', 'chatUsers')
        .select('JSON_ARRAYAGG(chatUsers.no) AS hosts')
        .where('meetings.no = :meetingNo', { meetingNo })
        .andWhere(`chatUsers.userType = ${UserType.HOST}`)
        .getRawOne();

      return meetingHosts;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 호스트 조회 에러(getMeetingHosts): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingGuests(meetingNo: number): Promise<MeetingGuests> {
    try {
      const meetingGuests: MeetingGuests = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin('meetings.chatRoomNo', 'chatList')
        .leftJoin('chatList.chatUserNo', 'chatUsers')
        .select('JSON_ARRAYAGG(chatUsers.no) AS guests')
        .where('meetings.no = :meetingNo', { meetingNo })
        .andWhere(`chatUsers.userType = ${UserType.GUEST}`)
        .getRawOne();

      return meetingGuests;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 호스트 조회 에러(getMeetingHosts): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateMeeting(
    no: number,
    updatedMeeting: UpdatedMeeting,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeeting)
        .where({ no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 수정 에러(updateMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async acceptMeeting(meetingNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set({ isAccepted: true })
        .where('no = :no', { no: meetingNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 수락 에러(acceptMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteMeeting(meetingNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Meetings)
        .where('no = :meetingNo', { meetingNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 삭제 에러(deleteMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async getChatRoomNoByMeetingNo(meetingNo: number): Promise<number> {
    try {
      const { chatRoomNo } = await this.createQueryBuilder('meetings')
        .select('chat_room_no AS chatRoomNo')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getRawOne();

      return chatRoomNo;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 확인(getChatRoomNoByMeetingNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
