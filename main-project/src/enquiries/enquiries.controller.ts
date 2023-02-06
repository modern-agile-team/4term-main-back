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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { APIResponse } from 'src/common/interface/interface';
import { EntityManager } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { EnquiryFilterDto } from './dto/enquiry-filter.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiriesService } from './enquiries.service';
import { Enquiry, Reply } from './interface/enquiry.interface';
import { ApiCreateEnquiry } from './swagger-decorator/create-enquiry.decorator';
import { ApiDeleteEnquiry } from './swagger-decorator/delete-enquiry.decorator';
import { ApiGetEnquiries } from './swagger-decorator/get-enquiries.decorator';
import { ApiGetEnquiry } from './swagger-decorator/get-enquiry.decorator';
import { ApiUpdateEnquiry } from './swagger-decorator/update-enquiry.decorator';

@Controller('enquiries')
@ApiTags('문의사항 API')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}
  //Get Methods
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetEnquiries()
  async getEnquiries(
    @TransactionDecorator() manager: EntityManager,
    @Query() enquiryFilterDto?: EnquiryFilterDto,
  ): Promise<APIResponse> {
    const eunqiries: Enquiry<string[]>[] =
      await this.enquiriesService.getEnquiries(manager, enquiryFilterDto);

    return { msg: '문의사항 전체 조회 성공', response: { eunqiries } };
  }

  @Get('/reply')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetEnquiry()
  async getAllReplies(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    const replies: Reply[] = await this.enquiriesService.getAllReplies(manager);

    return { response: replies };
  }

  @Get('/:enquiryNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetEnquiry()
  async getEnquiryByNo(
    @Param('enquiryNo') enquiryNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const enquiry: Enquiry<string[]> = await this.enquiriesService.getEnquiry(
      manager,
      enquiryNo,
      userNo,
    );

    return { msg: '문의사항 조회 성공', response: { enquiry } };
  }

  @Get('/:enquiryNo/reply')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '문의사항 답변 상세조회 API',
    description: '문의 번호를 통해 문의사항의 답변을 상세 조회한다.',
  })
  async getReplyByNo(
    @Param('enquiryNo') enquiryNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const reply: Reply = await this.enquiriesService.getReplyByNo(
      manager,
      enquiryNo,
    );

    return { response: reply };
  }

  // Post Methods
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiCreateEnquiry()
  async createEnquiry(
    @Body() enquiryDto: CreateEnquiryDto,
    @GetUser() userNo: number,
    @UploadedFiles() files: Express.Multer.File[],
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.createEnquiry(
      manager,
      enquiryDto,
      userNo,
      files,
    );

    return { msg: '문의사항 생성 성공' };
  }

  @Post('/:enquiryNo/reply')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  @ApiOperation({
    summary: '문의사항 답변 작성 API',
    description: '입력한 정보로 문의사항의 답변을 작성한다.',
  })
  async createReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() createReplyDto: CreateReplyDto,
    @UploadedFiles() files: Express.Multer.File[],
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.createReply(
      createReplyDto,
      enquiryNo,
      files,
      manager,
    );

    return { msg: '답변 생성 성공' };
  }
  // Patch Methods
  @Patch('/:enquiryNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  @ApiUpdateEnquiry()
  async updateReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
    @GetUser() userNo: number,
    @UploadedFiles() files: Express.Multer.File[],
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.editEnquiry(
      userNo,
      enquiryNo,
      updateEnquiryDto,
      manager,
      files,
    );

    return { msg: '문의사항 수정 성공' };
  }

  @Patch('/:enquiryNo/reply')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  @ApiOperation({
    summary: '답변 수정 API',
    description: '입력한 정보로 답변 내용을 수정한다.',
  })
  async updateEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
    @GetUser() userNo: number,
    @UploadedFiles() files: Express.Multer.File[],
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.updateReply(
      manager,
      enquiryNo,
      updateEnquiryDto,
      files,
    );

    return { msg: '답변 수정 성공' };
  }

  // Delete Methods
  @Delete('/:enquiryNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiDeleteEnquiry()
  async deleteEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.deleteEnquiry(manager, enquiryNo, userNo);

    return { msg: '문의사항 삭제 성공' };
  }

  @Delete('/:enquiryNo/reply')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '답변 삭제 API',
    description: '문의번호를 사용해 해당 문의사항의 답변을 삭제한다.',
  })
  async deleteReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.enquiriesService.deleteReplyByEnquiryNo(manager, enquiryNo);

    return { msg: '답변 삭제 성공' };
  }
}
