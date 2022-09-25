import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { GuestMembers } from '../entity/guest-members.entity';
import { InternalServerErrorException } from '@nestjs/common';

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

  async deleteGuest(meetingNo: number, userNo: number): Promise<number> {
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
}
