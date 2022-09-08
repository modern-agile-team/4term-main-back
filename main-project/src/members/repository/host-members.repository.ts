import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { HostMembers } from '../entity/host-members.entity';

@EntityRepository(HostMembers)
export class HostMembersRepository extends Repository<HostMembers> {
  async addHostMembers(hostsInfo): Promise<number> {
    const { raw }: InsertResult = await this.createQueryBuilder('host_members')
      .insert()
      .into(HostMembers)
      .values(hostsInfo)
      .execute();

    return raw.affectedRows;
  }
}
