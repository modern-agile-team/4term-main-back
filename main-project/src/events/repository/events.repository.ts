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
  async getEvents(): Promise<Events[]> {
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
        `${error} getEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEvent(eventNo: number): Promise<Events> {
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
        `${error} getEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createEvent(eventsDto: EventDto): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .insert()
        .into(Events)
        .values(eventsDto)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateEvent(eventNo: number, eventsDto: EventDto): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .update(Events)
        .set(eventsDto)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEvent(eventNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .delete()
        .from(Events)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
