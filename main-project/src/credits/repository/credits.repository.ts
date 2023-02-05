import { EntityRepository, Repository } from 'typeorm';
import { Credits } from '../entity/credits.entity';

@EntityRepository(Credits)
export class CreditsRepository extends Repository<Credits> {}
