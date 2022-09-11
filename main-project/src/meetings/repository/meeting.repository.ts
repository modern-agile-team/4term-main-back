import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UpdateMeetingDto } from '../dto/updateMeeting.dto';
import { Meetings } from '../entity/meeting.entity';
import { meetingResponseInfo } from '../meetings.service';
import { InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async createMeeting(meetingInfo: object): Promise<meetingResponseInfo> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('meetings')
        .insert()
        .into(Meetings)
        .values(meetingInfo)
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

  async updateMeeting(
    meeting: Meetings,
    updatedMeetingInfo: UpdateMeetingDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeetingInfo)
        .where('no = :no', { no: meeting.no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 수정 에러(updateMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async acceptMeeting(meeting: Meetings): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set({ isAccepted: true })
        .where('no = :no', { no: meeting.no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 수락 에러(acceptMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
