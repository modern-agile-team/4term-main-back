import { EntityRepository, InsertResult, Repository } from 'typeorm';
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
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} saveHostMembers: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
