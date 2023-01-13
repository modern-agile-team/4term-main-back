import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { APIResponse } from 'src/common/interface/interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';
import { Events } from './entity/events.entity';
import { EventDto } from './dto/event.dto';

@Controller('events')
@ApiTags('이벤트 API')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly awsService: AwsService,
  ) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '이벤트 전체조회 API',
    description: '이벤트을 내림차순으로 전체 조회한다.',
  })
  async getAllEvents(): Promise<APIResponse> {
    const events: Events[] = await this.eventsService.getAllEvents();

    return { response: events };
  }

  @Get('/:eventNo')
  @ApiOperation({
    summary: '특정 이벤트 조회 API',
    description: '번호를 통해 해당 이벤트을 조회한다.',
  })
  async getEventByNo(
    @Param('eventNo', ParseIntPipe) eventNo: number,
  ): Promise<APIResponse> {
    const events: Events = await this.eventsService.getEventByNo(eventNo);

    return { response: events };
  }

  @Get('/images/:eventNo')
  @ApiOperation({
    summary: '특정 이벤트 이미지 조회 API',
    description: '번호를 통해 해당 이벤트의 이미지을 조회한다.',
  })
  async getEventImages(
    @Param('eventNo', ParseIntPipe) eventNo: number,
  ): Promise<APIResponse> {
    const imageUrl: string[] = await this.eventsService.getEventImages(eventNo);

    return { response: imageUrl };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '이벤트 생성 API',
    description: '입력한 정보로 이벤트을 생성한다.',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async createEvent(@Body() eventsDto: EventDto): Promise<APIResponse> {
    await this.eventsService.createEvent(eventsDto);

    return { msg: '이벤트 생성 성공' };
  }

  @Post('/images/:eventNo')
  @ApiOperation({
    summary: '이벤트 이미지 업로드 API',
    description: 's3에 이미지 업로드 후 DB에 image 정보 생성.',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async uploadEventImages(
    @Param('eventNo', ParseIntPipe) eventNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'events',
    );

    await this.eventsService.uploadImageUrls(eventNo, imageUrls);

    return { msg: '이미지 업로드 성공' };
  }

  // Patch Methods
  @Patch('/:eventNo')
  @ApiOperation({
    summary: '이벤트 수정 API',
    description: '입력한 정보로 이벤트을 수정한다.',
  })
  async updateEvent(
    @Param('eventNo', ParseIntPipe) eventNo: number,
    @Body() eventsDto: EventDto,
  ): Promise<APIResponse> {
    await this.eventsService.updateEvent(eventNo, eventsDto);

    return { msg: '이벤트 수정 성공' };
  }

  // Delete Methods
  @Delete('/:eventNo')
  @ApiOperation({
    summary: '이벤트 삭제 API',
    description: '이벤트 번호를 사용해 이벤트을 삭제한다.',
  })
  async deleteEvent(
    @Param('eventNo', ParseIntPipe) eventNo: number,
  ): Promise<APIResponse> {
    const images: string[] = await this.eventsService.getEventImages(eventNo);

    await this.awsService.deleteFiles(images);
    await this.eventsService.deleteEventByNo(eventNo);

    return { msg: '이벤트 삭제 성공' };
  }

  // Delete Methods
  @Delete('/images/:eventNo')
  @ApiOperation({
    summary: '이벤트 이미지 삭제 API',
    description: '이벤트 번호를 사용해 이미지를 삭제한다.',
  })
  async deleteEventImages(
    @Param('eventNo', ParseIntPipe) eventNo: number,
  ): Promise<APIResponse> {
    const imagesUrls = await this.eventsService.getEventImages(eventNo);

    await this.awsService.deleteFiles(imagesUrls);
    await this.eventsService.deleteEventImages(eventNo);

    return { msg: '이벤트 이미지 삭제 성공' };
  }
}
