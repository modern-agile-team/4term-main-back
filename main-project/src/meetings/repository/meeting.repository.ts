import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UpdateMeetingDto } from '../dto/updateMeeting.dto';
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

  async updateMeeting(
    meetingNo: number,
    updatedMeetingInfo: UpdateMeetingDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeetingInfo)
        .where('no = :meetingNo', { meetingNo })
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
<<<<<<< HEAD
}
=======

  async getParticipatingMembers(
    meetingNo: number,
  ): Promise<ParticipatingMembers> {
    try {
      const result = await this.createQueryBuilder('meetings')
        .leftJoin(
          'meetings.meetingInfo',
          'meetingInfo',
          'meetings.no = meetingInfo.meetingNo',
        )
        .leftJoin('meetings.guestMembers', 'guestMembers')
        .leftJoin('meetings.hostMembers', 'hostMembers')
        .select([
          'meetingInfo.host AS adminHost',
          'meetingInfo.guest AS adminGuest',
          'meetingInfo.guestHeadcount AS guestHeadcount',
          'meetingInfo.hostHeadcount AS hostHeadcount',
          'GROUP_CONCAT(DISTINCT guestMembers.userNo) AS guests',
          'GROUP_CONCAT(DISTINCT hostMembers.userNo) AS hosts',
          '(meetingInfo.guestHeadcount - COUNT(DISTINCT guestMembers.userNo)) AS addGuestAvailable',
          '(meetingInfo.hostHeadcount - COUNT(DISTINCT hostMembers.userNo)) AS addHostAvailable',
        ])
        .where('meetings.no = :meetingNo', { meetingNo })
        .groupBy('meetings.no')
        .getRawOne();

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 참여 중인 유저 조회(getParticipatingMembers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
>>>>>>> a62eca5a72f5f41fb72155c28572f6b44d4fc772
