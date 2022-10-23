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
  ParticipatingMembers,
  MeetingDetail,
  MeetingResponse,
} from '../interface/meeting.interface';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async createMeeting(meetingInfo: MeetingDetail): Promise<MeetingResponse> {
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

  async updateMeeting(no: number, updatedMeetingInfo: object): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeetingInfo)
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

  async getMeetingMembers(meetingNo: number): Promise<any> {
    try {
      const members: object = await this.createQueryBuilder('meetings')
        .leftJoin(
          'meetings.guestMembers',
          'guestMembers',
          'meetings.no = guestMembers.meetingNo',
        )
        .leftJoin(
          'meetings.hostMembers',
          'hostMembers',
          'meetings.no = hostMembers.meetingNo',
        )
        .select([
          `CONCAT(GROUP_CONCAT(DISTINCT hostMembers.userNo),
          IF(COUNT(guestMembers.userNo),CONCAT(",", GROUP_CONCAT(DISTINCT guestMembers.userNo)), ""))
          AS members`,
          // 'GROUP_CONCAT(DISTINCT guestMembers.userNo) AS guests',
          // 'GROUP_CONCAT(DISTINCT hostMembers.userNo) AS hosts',
        ])
        .where('meetings.no = :meetingNo', { meetingNo })
        .getRawOne();

      return members;
    } catch (err) {
      throw err;
    }
  }

  async getMeetingVacancy(meetingNo: number): Promise<ParticipatingMembers> {
    try {
      const result: ParticipatingMembers = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin(
          'meetings.meetingInfo',
          'meetingInfo',
          'meetings.no = meetingInfo.meetingNo',
        )
        .leftJoin(
          'meetings.guestMembers',
          'guestMembers',
          'meetings.no = guestMembers.meetingNo',
        )
        .leftJoin(
          'meetings.hostMembers',
          'hostMembers',
          'meetings.no = hostMembers.meetingNo',
        )
        .select([
          'IF(meetingInfo.guestHeadcount > COUNT(DISTINCT guestMembers.userNo),TRUE, FALSE) AS addGuestAvailable',
          'IF(meetingInfo.hostHeadcount > COUNT(DISTINCT hostMembers.userNo), TRUE, FALSE) AS addHostAvailable',
        ])
        .where('meetings.no = :meetingNo', { meetingNo })
        .groupBy('meetings.no')
        .getRawOne();

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 공석 조회(getMeetingVacancy): 알 수 없는 서버 에러입니다.`,
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
}
