import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EventDto } from '../dto/event.dto';
import { Events } from '../entity/events.entity';

@EntityRepository(Events)
export class EventsRepository extends Repository<Events> {
  //  조회 관련
  async getAllEvents(): Promise<Events[]> {
    try {
      const events = this.createQueryBuilder('events')
        .select([
          'events.no AS no',
          'events.title AS title',
          'events.description AS description',
        ])
        .orderBy('no', 'DESC');

      return events.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEventByNo(eventNo: number): Promise<Events> {
    try {
      const events = this.createQueryBuilder('events')
        .leftJoin('events.eventImages', 'images')
        .select([
          'events.no AS no',
          'events.title AS title',
          'events.description AS description',
          'JSON_ARRAYAGG(images.imageUrl) AS images',
        ])
        .where('events.no = :eventNo', { eventNo })
        .getRawOne();

      return events;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEventByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createEvents(eventsDto: EventDto): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('events')
        .insert()
        .into(Events)
        .values(eventsDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateEvents(eventNo: number, eventsDto: EventDto): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('events')
        .update(Events)
        .set(eventsDto)
        .where('no = :eventNo', { eventNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEventsByNo(eventNo: number): Promise<DeleteResult> {
    try {
      const raw: DeleteResult = await this.createQueryBuilder('events')
        .delete()
        .from(Events)
        .where('no = :eventNo', { eventNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEventsByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
