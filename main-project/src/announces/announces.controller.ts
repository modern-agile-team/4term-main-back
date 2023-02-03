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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncesService } from './announces.service';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { APIResponse } from 'src/common/interface/interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { Announce } from './interface/announces.interface';
import { ApiGetAnnounces } from './swagger-decorator/get-annoucnes.decorator';
import { ApiGetAnnounce } from './swagger-decorator/get-announce.decorator';
import { ApiCreateAnnounce } from './swagger-decorator/create-announce.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ApiDeleteAnnounce } from './swagger-decorator/delete-announce.decorator';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { ApiUpdateAnnounce } from './swagger-decorator/update-announce.decorator';

@Controller('announces')
@ApiTags('공지사항 API')
export class AnnouncesController {
<<<<<<< HEAD
  constructor(
    private readonly announcesService: AnnouncesService,
    private readonly awsService: AwsService,
  ) {}
=======
  constructor(private readonly announcesService: AnnouncesService) {}
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
  //Get Methods
  @Get()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @ApiCreateAnnounce()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Body() createAnnounceDto: CreateAnnounceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
<<<<<<< HEAD
<<<<<<< HEAD
    await this.announcesService.createAnnounces(manager, announcesDto);
=======
    await this.announcesService.createAnnounces(announcesDto);
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
=======
    await this.announcesService.createAnnounces(
      manager,
      createAnnounceDto,
      files,
      userNo,
    );
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f

    return { response: { msg: '공지사항 생성 성공' } };
  }

<<<<<<< HEAD
  @Post('/images/:announcesNo')
  @ApiOperation({
    summary: '공지사항 이미지 업로드 API',
    description: 's3에 이미지 업로드 후 DB에 image 정보 생성.',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async uploadAnnouncesImages(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
<<<<<<< HEAD
    const images = await this.awsService.uploadImages(files, 'announces');

    await this.announcesService.uploadImageUrls(announcesNo, images);

    return { response: { images } };
=======
    const imageURLs = await this.awsService.uploadImages(files, 'announces');

    await this.announcesService.uploadAnnouncesimagesUrl(
      announcesNo,
      imageURLs,
    );

    return { response: { msg: '이미지 업로드 성공' } };
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
  }

=======
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
  // Patch Methods
  @Patch('/:announcesNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiUpdateAnnounce()
  async updateAnnounces(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @Body() updateAnnounceDto: UpdateAnnounceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    await this.announcesService.editAnnounce(
      manager,
      userNo,
      announcesNo,
      updateAnnounceDto,
      files,
    );

    return { response: { msg: '공지사항 수정 성공' } };
  }

  // Delete Methods
  @Delete('/:announcesNo')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiDeleteAnnounce()
  async deleteAnnounces(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
<<<<<<< HEAD
    await this.announcesService.deleteAnnouncesByNo(announcesNo);

    await this.announcesService.deleteAnnouncesImages(announcesNo);

    const images = await this.announcesService.getAnnouncesImages(announcesNo);

    await this.awsService.deleteFiles(images);

    return { response: { msg: '공지사항 삭제 성공' } };
  }

  // Delete Methods
  @Delete('/images/:announcesNo')
  @ApiOperation({
    summary: '공지사항 이미지 삭제 API',
    description: '공지사항 번호를 사용해 이미지를 삭제한다.',
  })
  async deleteAnnouncesimages(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const imagesUrlList = await this.announcesService.getAnnouncesImages(
      announcesNo,
    );

    await this.announcesService.deleteAnnouncesImages(announcesNo);

    await this.awsService.deleteFiles(imagesUrlList);

<<<<<<< HEAD
    return { response: { msg: '공지사항 이미지 삭제 성공' } };
=======
    return { response: { msg: '이미지 삯제 성공' } };
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
  }
=======
    await this.announcesService.deleteAnnounceByNo(
      manager,
      announcesNo,
      userNo,
    );

    return { response: { msg: '공지사항 삭제 성공' } };
  }
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
}
