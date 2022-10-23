import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { GuestMembers } from '../entity/guest-members.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { DeleteMember } from '../interface/member.interface';

@EntityRepository(GuestMembers)
export class GuestMembersRepository extends Repository<GuestMembers> {
  async saveGuestMembers(guestsInfo: object[]): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'guest_members',
      )
        .insert()
        .into(GuestMembers)
        .values(guestsInfo)
        .execute();

      return raw.affectedRows;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} saveHostMembers: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteGuest({ meetingNo, userNo }: DeleteMember): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(GuestMembers)
        .where('meetingNo = :meetingNo', { meetingNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} deleteGuest: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingGuest(meetingNo: number): Promise<string> {
    try {
      const { guests } = await this.createQueryBuilder('guest_members')
        .leftJoin(
          'guest_members.meetingNo',
          'meetings',
          'guest_members.meetingNo = meetings.no',
        )
        .select('GROUP_CONCAT(DISTINCT guest_members.userNo) AS guests')
        .where('meetings.no =:meetingNo', { meetingNo })
        .getRawOne();

      return guests;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} getMeetingGuest: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
