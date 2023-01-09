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
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';

@Controller('announces')
@ApiTags('공지사항 API')
export class AnnouncesController {
  constructor(
    private announcesService: AnnouncesService,
    private readonly awsService: AwsService,
  ) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '공지사항 전체조회 API',
    description: '공지사항을 내림차순으로 전체 조회한다.',
  })
  async getAllAnnounces(): Promise<APIResponse> {
    const announces: Announces[] =
      await this.announcesService.getAllAnnounces();

    return { response: announces };
  }

  @Get('/:announcesNo')
  @ApiOperation({
    summary: '특정 공지사항 조회 API',
    description: '번호를 통해 해당 공지사항을 조회한다.',
  })
  async getAnnouncesByNo(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const announces: Announces = await this.announcesService.getAnnouncesByNo(
      announcesNo,
    );

    return { response: announces };
  }

  @Get('/images/:announcesNo')
  @ApiOperation({
    summary: '특정 공지사항 이미지 조회 API',
    description: '번호를 통해 해당 공지사항의 이미지을 조회한다.',
  })
  async getAnnouncesImages(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const images: string[] = await this.announcesService.getAnnouncesImages(
      announcesNo,
    );

    return { response: { images } };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '입력한 정보로 공지사항을 생성한다.',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async createAnnounces(
    @Body() announcesDto: AnnouncesDto,
  ): Promise<APIResponse> {
    await this.announcesService.createAnnounces(announcesDto);

    return { response: { msg: '공지사항 생성 성공' } };
  }

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
    const imageURLs = await this.awsService.uploadImages(files, 'announces');

    await this.announcesService.uploadAnnouncesimagesUrl(
      announcesNo,
      imageURLs,
    );

    return { response: { msg: '이미지 업로드 성공' } };
  }

  // Patch Methods
  @Patch('/:announcesNo')
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '입력한 정보로 공지사항을 수정한다.',
  })
  async updateAnnounces(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @Body() announcesDto: AnnouncesDto,
  ): Promise<APIResponse> {
    await this.announcesService.updateAnnounces(announcesNo, announcesDto);

    return { response: { msg: '공지사항 수정 성공' } };
  }

  // Delete Methods
  @Delete('/:announcesNo')
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항 번호를 사용해 공지사항을 삭제한다.',
  })
  async deleteAnnounces(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const announces: string = await this.announcesService.deleteAnnouncesByNo(
      announcesNo,
    );

    await this.announcesService.deleteAnnouncesImages(announcesNo);

    const imagesUrlList = await this.announcesService.getAnnouncesImages(
      announcesNo,
    );

    await this.awsService.deleteFiles(imagesUrlList);

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

    return { response: { msg: '이미지 삯제 성공' } };
  }
}
