import { EntityRepository, Repository } from 'typeorm';
import { GuestMembers } from '../entity/guest-members.entity';

@EntityRepository(GuestMembers)
export class GuestMembersRepository extends Repository<GuestMembers> {
  async addGuestMembers(meetingNo, host) {
    const guestMember = await this.createQueryBuilder('guest_members')
      .insert()
      .into(GuestMembers)
      .values(
        host.reduce((values, userNo) => {
          values.push({ meetingNo, userNo });
        }, []),
      )
      .execute();

    return guestMember.raw;
  }
}
