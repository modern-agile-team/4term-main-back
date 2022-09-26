import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { Friends } from '../entity/friend.entity';
import { FriendRequestDetail } from '../interface/friend.interface';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {}
