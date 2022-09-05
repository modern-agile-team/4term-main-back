import { EntityRepository, Repository } from 'typeorm';
import { HostMembers } from '../entity/host-members.entity';

@EntityRepository(HostMembers)
export class HostMembersRepository extends Repository<HostMembers> {}
