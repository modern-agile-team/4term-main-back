import { EntityRepository, Repository } from 'typeorm';
import { Manners } from '../entity/manners.entity';

@EntityRepository(Manners)
export class MannersRepository extends Repository<Manners> {}
