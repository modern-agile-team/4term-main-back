import { EntityRepository, Repository } from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {}
