import { EntityRepository, Repository } from 'typeorm';
import { Users } from '../entity/user.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {}
