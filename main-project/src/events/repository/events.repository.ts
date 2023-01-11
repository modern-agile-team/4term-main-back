import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
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
      const events: Events[] = await this.createQueryBuilder()
        .select(['no AS no', 'title AS title', 'description AS description'])
        .orderBy('no', 'DESC')
        .getRawMany();

      return events;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEventByNo(eventNo: number): Promise<Events> {
    try {
      const events: Events = await this.createQueryBuilder('events')
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
  async createEvent(eventsDto: EventDto): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Events)
        .values(eventsDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateEvent(
    eventNo: number,
    eventsDto: EventDto,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: UpdateResult = await this.createQueryBuilder()
        .update(Events)
        .set(eventsDto)
        .where('no = :eventNo', { eventNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEventByNo(eventNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Events)
        .where('no = :eventNo', { eventNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEventByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
