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
import { AnnouncesService } from './announces.service';
import { AnnouncesDto } from './dto/announce.dto';
import { Announces } from './entity/announce.entity';
import { APIResponse } from 'src/common/interface/interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { Announce } from './interface/announces.interface';
import { ApiGetAnnounces } from './swagger-decorator/get-annoucnes.decorator';
import { ApiGetAnnounce } from './swagger-decorator/get-announce.decorator';

@Controller('announces')
@ApiTags('공지사항 API')
export class AnnouncesController {
  constructor(
    private announcesService: AnnouncesService,
    private readonly awsService: AwsService,
  ) {}
  //Get Methods
  @Get()
  @UseInterceptors(TransactionInterceptor)
  @ApiGetAnnounces()
  async getAnnounces(
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const announces: Announce<string[]>[] =
      await this.announcesService.getAnnounces(manager);

    return { msg: '공지사항 전체조회 성공', response: { announces } };
  }

  @Get('/:announceNo')
  @UseInterceptors(TransactionInterceptor)
  @ApiGetAnnounce()
  async getAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @Param('announceNo', ParseIntPipe) announceNo: number,
  ): Promise<APIResponse> {
    const announce: Announce<string[]> =
      await this.announcesService.getAnnounce(manager, announceNo);

    return { msg: '공지사항 상세 조회 성공', response: { announce } };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '입력한 정보로 공지사항을 생성한다.',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createAnnounces(
    @TransactionDecorator() manager: EntityManager,
    @Body() announcesDto: AnnouncesDto,
  ): Promise<APIResponse> {
    await this.announcesService.createAnnounces(manager, announcesDto);

    return { response: { msg: '공지사항 생성 성공' } };
  }

  @Post('/images/:announcesNo')
  @ApiOperation({
    summary: '공지사항 이미지 업로드 API',
    description: 's3에 이미지 업로드 후 DB에 image 정보 생성.',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadAnnouncesImages(
    @TransactionDecorator() manager: EntityManager,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    const imageURLs = await this.awsService.uploadImages(files, 'announces');

    await this.announcesService.uploadAnnouncesimagesUrl(
      manager,
      announcesNo,
      imageURLs,
    );

    return { response: { msg: '이미지 업로드 성공' } };
  }

  // Patch Methods
  @Patch('/:announcesNo')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '입력한 정보로 공지사항을 수정한다.',
  })
  async updateAnnounces(
    @TransactionDecorator() manager: EntityManager,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @Body() announcesDto: AnnouncesDto,
  ): Promise<APIResponse> {
    await this.announcesService.updateAnnounces(
      manager,
      announcesNo,
      announcesDto,
    );

    return { response: { msg: '공지사항 수정 성공' } };
  }

  // Delete Methods
  @Delete('/:announcesNo')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항 번호를 사용해 공지사항을 삭제한다.',
  })
  async deleteAnnounces(
    @TransactionDecorator() manager: EntityManager,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const announces: string = await this.announcesService.deleteAnnouncesByNo(
      manager,
      announcesNo,
    );

    await this.announcesService.deleteAnnouncesImages(manager, announcesNo);

    // const imagesUrlList = await this.announcesService.getAnnouncesImages(
    //   announcesNo,
    // );

    // await this.awsService.deleteFiles(imagesUrlList);

    return { response: { msg: '공지사항 삭제 성공' } };
  }

  // Delete Methods
  @Delete('/images/:announcesNo')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '공지사항 이미지 삭제 API',
    description: '공지사항 번호를 사용해 이미지를 삭제한다.',
  })
  async deleteAnnouncesimages(
    @TransactionDecorator() manager: EntityManager,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    // const imagesUrlList = await this.announcesService.getAnnouncesImages(
    //   announcesNo,
    // );

    await this.announcesService.deleteAnnouncesImages(manager, announcesNo);

    // await this.awsService.deleteFiles(imagesUrlList);

    return { response: { msg: '이미지 삯제 성공' } };
  }
}
