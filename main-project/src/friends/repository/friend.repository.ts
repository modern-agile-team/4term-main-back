import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { Friends } from '../entity/friend.entity';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {}
