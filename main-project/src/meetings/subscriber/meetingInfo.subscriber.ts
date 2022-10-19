import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';

@EventSubscriber()
export class MeetingInfoSubscribler
  implements EntitySubscriberInterface<MeetingInfo>
{
  listenTo(): any {
    return MeetingInfo;
  }

  afterUpdate(event: UpdateEvent<MeetingInfo>): void | Promise<any> {
    console.log('jeee');

    console.log(event.entity);
  }
  async afterRemove(event: RemoveEvent<MeetingInfo>) {
    console.log(event.entity);
  }
}
