import { EntityRepository, Repository } from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { Meeting } from '../entity/meeting.entity';

@EntityRepository(Meeting)
export class MeetingRepository extends Repository<Meeting> {}

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {}
