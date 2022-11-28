import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { MannerLog } from '../entity/manners-log.entity';
import { Manners } from '../entity/manners.entity';

@EntityRepository(MannerLog)
export class MannersLogRepository extends Repository<MannerLog> {}
