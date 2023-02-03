import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { EventDto } from './dto/event.dto';
import { Events } from './entity/events.entity';
import { EventImagesRepository } from './repository/events-image.repository';
import { EventsRepository } from './repository/events.repository';
import { Event } from './interface/events.interface';
import { EventFilterDto } from './dto/event-filter.dto';

@Injectable()
export class EventsService {
  constructor() {}
  // 생성 관련
  async createEvent(
    eventsDto: EventDto,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getCustomRepository(EventsRepository).createEvent(eventsDto);
  }

  async uploadImageUrls(
    eventNo: number,
    imageUrls: string[],
    manager: EntityManager,
  ): Promise<void> {
    await this.getEvent(eventNo, manager);

    if (!imageUrls.length) {
      throw new BadRequestException('사진이 없습니다.');
    }
    const images = imageUrls.map((url) => {
      return { eventNo, imageUrl: url };
    });

    await manager
      .getCustomRepository(EventImagesRepository)
      .uploadEventImagesUrl(images);
  }

  // 조회 관련
  async getEvents(
    manager: EntityManager,
    eventFilterDto?: EventFilterDto,
  ): Promise<Event<string[]>[]> {
    const events: Event<string[]>[] = await manager
      .getCustomRepository(EventsRepository)
      .getEvents(eventFilterDto);

    if (!events.length) {
      throw new NotFoundException(
        `이벤트 조회(getAllEvents-service): 이벤트가 없습니다.`,
      );
    }

    return events;
  }

  async getEventImages(
    eventNo: number,
    manager: EntityManager,
  ): Promise<string[]> {
    const { imageUrl } = await manager
      .getCustomRepository(EventImagesRepository)
      .getEventImages(eventNo);

    if (!imageUrl) {
      throw new NotFoundException(
        `이미지 조회(getEventsImages-service): 이미지가 없습니다.`,
      );
    }

    const images = JSON.parse(imageUrl);

    return images;
  }

  async getEvent(eventNo: number, manager: EntityManager): Promise<Events> {
    const event: Events = await manager
      .getCustomRepository(EventsRepository)
      .getEvent(eventNo);

    if (!event.no) {
      throw new NotFoundException(
        `이벤트 상세 조회(getEvent-service): ${eventNo}번 이벤트이 없습니다.`,
      );
    }

    return event;
  }

  // 수정 관련
  async updateEvent(
    eventNo: number,
    eventsDto: EventDto,
    manager: EntityManager,
  ): Promise<void> {
    await this.getEvent(eventNo, manager);

    await manager
      .getCustomRepository(EventsRepository)
      .updateEvent(eventNo, eventsDto);
  }

  // 삭제 관련
  async deleteEvent(eventNo: number, manager: EntityManager): Promise<void> {
    await this.getEvent(eventNo, manager);

    await manager.getCustomRepository(EventsRepository).deleteEvent(eventNo);
  }

  async deleteEventImages(
    eventNo: number,
    manager: EntityManager,
  ): Promise<void> {
    await this.getEvent(eventNo, manager);
    await this.getEventImages(eventNo, manager);

    await manager
      .getCustomRepository(EventImagesRepository)
      .deleteEventImages(eventNo);
  }
}
