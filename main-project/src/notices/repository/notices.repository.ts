import { EntityRepository, Repository } from 'typeorm';
import { Notices } from '../entity/notices.entity';

@EntityRepository(Notices)
export class NoticesRepository extends Repository<Notices> {}
