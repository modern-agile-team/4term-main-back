import { EntityRepository, Repository } from 'typeorm';
import { Meeting } from '../entity/meeting.entity';

@EntityRepository(Meeting)
export class MeetingRepository extends Repository<Meeting> {}
