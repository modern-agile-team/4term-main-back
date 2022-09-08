import { EntityRepository, Repository } from 'typeorm';
import { HostMembers } from '../entity/host-members.entity';

@EntityRepository(HostMembers)
export class HostMembersRepository extends Repository<HostMembers> {
  async addHostMembers(meetingNo, host) {
    const hostMember = await this.createQueryBuilder('host_members')
      .insert()
      .into(HostMembers)
      .values(
        host.reduce((values, userNo) => {
          values.push({ meetingNo, userNo });
        }, []),
      )
      .execute();

    return hostMember.raw;
  }
}
