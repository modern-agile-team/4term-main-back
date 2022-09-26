import { EntityRepository, Repository } from 'typeorm';
import { Reports } from '../entity/reports.entity';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {}
