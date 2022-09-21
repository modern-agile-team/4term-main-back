import { EntityRepository, Repository } from 'typeorm';
import { GuestMembers } from '../entity/guest-members.entity';
import { HostMembers } from '../entity/host-members.entity';

@EntityRepository(HostMembers)
export class HostMembersRepository extends Repository<HostMembers> {}

@EntityRepository(GuestMembers)
export class GuestMembersRepository extends Repository<GuestMembers> {}
