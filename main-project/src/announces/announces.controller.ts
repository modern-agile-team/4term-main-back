import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncesService } from './announces.service';
import { AnnouncesDto } from './dto/announce.dto';
import { AnnouncesFilterDto } from './dto/announce-filter.dto';
import { Announces } from './entity/announce.entity';
import { APIResponse } from 'src/common/interface/interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { AnnouncesImages } from './entity/announce-images.entity';

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
    summary: '공지사항 필터링 API',
    description: '공지사항을 필터링을 통해 내림차순으로 조회한다.',
  })
  async getAllAnnounces(
    @Query() filter: AnnouncesFilterDto,
  ): Promise<APIResponse> {
    const announces: Announces[] = await this.announcesService.getAnnounces(
      filter,
    );

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
    const announcement: Announces =
      await this.announcesService.getAnnouncesByNo(announcesNo);

    return { response: announcement };
  }

  @Get('/images/:announcesNo')
  @ApiOperation({
    summary: '특정 공지사항 이미지 조회 API',
    description: '번호를 통해 해당 공지사항의 이미지을 조회한다.',
  })
  async getAnnouncesImages(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const imageUrl: string[] = await this.announcesService.getAnnouncesImages(
      announcesNo,
    );

    return { response: { imageUrl } };
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
    @TransactionDecorator() manager,
  ): Promise<APIResponse> {
    const Announces: string = await this.announcesService.createAnnounces(
      manager,
      announcesDto,
    );

    return { response: { Announces } };
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
    const uploadedImagesUrlList = await this.awsService.uploadAnnouncesFiles(
      files,
    );

    await this.announcesService.uploadAnnouncesimagesUrl(
      announcesNo,
      uploadedImagesUrlList,
    );

    return { response: { uploadedImagesUrlList } };
  }

  // Patch Methods
  @Patch('/:announcesNo')
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '입력한 정보로 공지사항을 수정한다.',
  })
  async updateAnnounces(
    @TransactionDecorator() manager,
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
    @Body() announcesDto: AnnouncesDto,
  ): Promise<APIResponse> {
    const announces: string = await this.announcesService.updateAnnounces(
      manager,
      announcesNo,
      announcesDto,
    );

    return { response: { announces } };
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

    return { response: { announces } };
  }

  // Delete Methods
  @Delete('/images/:announcesNo')
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항 번호를 사용해 공지사항을 삭제한다.',
  })
  async deleteAnnouncesimages(
    @Param('announcesNo', ParseIntPipe) announcesNo: number,
  ): Promise<APIResponse> {
    const imagesUrlList = await this.announcesService.getAnnouncesImages(
      announcesNo,
    );

    await this.announcesService.deleteAnnouncesImages(announcesNo);

    await this.awsService.deleteFiles(imagesUrlList, 'announces');

    return { response: { true: true } };
  }
}
