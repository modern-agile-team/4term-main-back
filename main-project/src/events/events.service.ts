import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EventDto } from './dto/event.dto';
import { Events } from './entity/events.entity';
import { EventImagesRepository } from './repository/events-image.repository';
import { EventsRepository } from './repository/events.repository';

@Injectable()
export class EventsService {
  private readonly s3: AWS.S3;

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsImagesRepository: EventImagesRepository,
  ) {}
  // 생성 관련
  async createEvent(eventsDto: EventDto): Promise<void> {
    const { affectedRows }: ResultSetHeader =
      await this.eventsRepository.createEvent(eventsDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `이벤트 생성(createEvent-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async uploadImageUrls(eventNo: number, imageUrls: string[]): Promise<void> {
    await this.getEventByNo(eventNo);

    if (!imageUrls.length) {
      throw new BadRequestException('사진이 없습니다.');
    }
    const images = imageUrls.map((url) => {
      return { eventNo, imageUrl: url };
    });

    await this.eventsImagesRepository.uploadEventImagesUrl(images);
  }

  // 조회 관련
  async getEvents(): Promise<Events[]> {
    const events: Events[] = await this.eventsRepository.getEvents();

    if (!events.length) {
      throw new NotFoundException(
        `이벤트 조회(getAllEvents-service): 이벤트가 없습니다.`,
      );
    }

    return events;
  }

  async getEventImages(eventNo: number): Promise<string[]> {
    const { imageUrl } = await this.eventsImagesRepository.getEventImages(
      eventNo,
    );

    if (!imageUrl) {
      throw new NotFoundException(
        `이미지 조회(getEventsImages-service): 이미지가 없습니다.`,
      );
    }

    const images = JSON.parse(imageUrl);

    return images;
  }

  async getEventByNo(eventNo: number): Promise<Events> {
    const event: Events = await this.eventsRepository.getEventByNo(eventNo);

    if (!event.no) {
      throw new NotFoundException(
        `이벤트 상세 조회(getEventByNo-service): ${eventNo}번 이벤트이 없습니다.`,
      );
    }

    return event;
  }

  // 수정 관련
  async updateEvent(eventNo: number, eventsDto: EventDto): Promise<void> {
    await this.getEventByNo(eventNo);

    const { affectedRows }: ResultSetHeader =
      await this.eventsRepository.updateEvent(eventNo, eventsDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `이벤트 수정(updateEvent-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEventByNo(eventNo: number): Promise<void> {
    await this.getEventByNo(eventNo);

    const { affectedRows }: ResultSetHeader =
      await this.eventsRepository.deleteEventByNo(eventNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `이벤트 삭제(deleteEventByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteEventImages(eventNo: number): Promise<void> {
    await this.getEventByNo(eventNo);
    await this.getEventImages(eventNo);

    const { affectedRows }: ResultSetHeader =
      await this.eventsImagesRepository.deleteEventImages(eventNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `이미지 삭제(deleteEventImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
