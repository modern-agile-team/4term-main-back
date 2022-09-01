import { EntityRepository, Repository } from 'typeorm';
import { GuestMembers } from '../entity/guest-members.entity';

@EntityRepository(GuestMembers)
export class GuestMembersRepository extends Repository<GuestMembers> {}
