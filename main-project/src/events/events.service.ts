import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { DeleteResult } from 'typeorm';
import { EventDto } from './dto/event.dto';
import { Events } from './entity/events.entity';
import { EventImagesRepository } from './repository/events-image.repository';
import { EventsRepository } from './repository/events.repository';

@Injectable()
export class EventsService {
  private readonly s3: AWS.S3;

  constructor(
    @InjectRepository(EventsRepository)
    private readonly eventsRepository: EventsRepository,

    @InjectRepository(EventImagesRepository)
    private readonly eventsImagesRepository: EventImagesRepository,
  ) {}
  // 생성 관련
  async createEvent(eventsDto: EventDto): Promise<string> {
    const { insertId }: CreateResponse =
      await this.eventsRepository.createEvents(eventsDto);

    if (!insertId) {
      throw new InternalServerErrorException(
        `이벤트 생성(createEvent-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${insertId}번 이벤트 생성 성공`;
  }

  async uploadEventImagesUrl(
    eventNo: number,
    uploadedImagesUrlList: string[],
  ): Promise<string> {
    const event = await this.getEventByNo(eventNo);

    if (uploadedImagesUrlList.length === 0) {
      throw new BadRequestException('사진이 없습니다.');
    }
    const images = uploadedImagesUrlList.map((url) => {
      return { eventNo, imageUrl: url };
    });

    const { insertId }: CreateResponse =
      await this.eventsImagesRepository.uploadEventImagesUrl(images);

    if (!insertId) {
      throw new InternalServerErrorException(
        `이미지 업로드(uploadEventImagesUrl-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `이미지 업로드 성공`;
  }

  // 조회 관련
  async getAllEvents(): Promise<Events[]> {
    const events: Events[] = await this.eventsRepository.getAllEvents();

    if (events.length === 0) {
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
  async updateEvent(eventNo: number, eventsDto: EventDto): Promise<string> {
    await this.getEventByNo(eventNo);

    const affectedRows: number = await this.eventsRepository.updateEvents(
      eventNo,
      eventsDto,
    );

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `이벤트 수정(updateEvent-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${eventNo}번 이벤트이 수정되었습니다.`;
  }

  // 삭제 관련
  async deleteEventByNo(eventNo: number): Promise<string> {
    await this.getEventByNo(eventNo);

    const { affected }: DeleteResult =
      await this.eventsRepository.deleteEventsByNo(eventNo);

    if (!affected) {
      throw new BadRequestException(
        `이벤트 삭제(deleteEventByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${eventNo}번 이벤트 삭제 성공`;
  }

  async deleteEventImages(eventNo: number): Promise<string[]> {
    await this.getEventByNo(eventNo);
    const images = await this.eventsImagesRepository.find({
      where: {
        eventNo,
      },
    });
    const imageUrlList: string[] = images.map((el) => {
      return el.imageUrl;
    });

    if (images.length > 0) {
      const { affected }: DeleteResult =
        await this.eventsImagesRepository.deleteEventImages(eventNo);

      if (!affected) {
        throw new BadRequestException(
          `이미지 삭제(deleteEventImages-service): 알 수 없는 서버 에러입니다.`,
        );
      }

      return imageUrlList;
    }

    return [];
  }
}
