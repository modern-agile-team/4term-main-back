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
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { APIResponse } from 'src/common/interface/interface';
import { EntityManager } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiriesService } from './enquiries.service';
import { EnquiryReplies } from './entity/enquiry-reply.entity';
import { Enquiries } from './entity/enquiry.entity';

@Controller('enquiries')
@ApiTags('문의사항 API')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '문의사항 전체 조회 API',
    description: '문의사항 전부를 내림차순으로 조회한다.',
  })
  async getAllEnquiries(): Promise<APIResponse> {
    const eunqiries: Enquiries[] =
      await this.enquiriesService.getAllEnquiries();

    return { response: { eunqiries } };
  }

  @Get('/reply')
  @ApiOperation({
    summary: '문의사항 답변 전체조회 API',
    description: '문의사항의 답변들을 전체 조회한다.',
  })
  async getAllReplies(): Promise<APIResponse> {
    const replies: EnquiryReplies[] =
      await this.enquiriesService.getAllReplies();

    return { response: replies };
  }

  @Get('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 상세 조회 API',
    description: '문의 번호를 통해 문의사항을 상세 조회한다.',
  })
  async getEnquiriesByNo(
    @Param('enquiryNo') enquiryNo: number,
  ): Promise<APIResponse> {
    const enquiry: Enquiries = await this.enquiriesService.getEnquiryByNo(
      enquiryNo,
    );

    return { response: enquiry };
  }

  @Get('/:enquiryNo/reply')
  @ApiOperation({
    summary: '문의사항 답변 상세조회 API',
    description: '문의 번호를 통해 문의사항의 답변을 상세 조회한다.',
  })
  async getReplyByNo(
    @Param('enquiryNo') enquiryNo: number,
  ): Promise<APIResponse> {
    const reply: EnquiryReplies = await this.enquiriesService.getReplyByNo(
      enquiryNo,
    );

    return { response: reply };
  }

  // Post Methods
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  @ApiOperation({
    summary: '문의사항 생성 API',
    description: '입력한 정보로 문의사항을 생성한다.',
  })
  async createEnquiry(
    @GetUser() userNo: number,
    @Body() enquiryDto: CreateEnquiryDto,
    @TransactionDecorator() manager: EntityManager,
    @UploadedFiles() files: Express.Multer.File[],
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
  @ApiOperation({
    summary: '문의사항 답변 작성 API',
    description: '입력한 정보로 문의사항의 답변을 작성한다.',
  })
  async createReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<APIResponse> {
    await this.enquiriesService.createReply({ createReplyDto, enquiryNo });

    return { msg: '답변 생성 성공' };
  }
  // Patch Methods
  @Patch('/:enquiryNo')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '문의사항 수정 API',
    description: '입력한 정보로 문의 내용을 수정한다.',
  })
  async updateReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<APIResponse> {
    await this.enquiriesService.updateReply(enquiryNo, updateEnquiryDto);

    return { msg: '문의사항 수정 성공' };
  }

  @Patch('/:enquiryNo/reply')
  @ApiOperation({
    summary: '답변 수정 API',
    description: '입력한 정보로 문의 내용을 수정한다.',
  })
  async updateEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<APIResponse> {
    await this.enquiriesService.updateEnquiry(enquiryNo, updateEnquiryDto);

    return { msg: '답변 수정 성공' };
  }

  // Delete Methods
  @Delete('/:enquiryNo')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '문의사항 삭제 API',
    description: '문의번호를 사용해 해당 문의사항을 삭제한다.',
  })
  async deleteEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
  ): Promise<APIResponse> {
    await this.enquiriesService.deleteEnquiryByNo(enquiryNo);

    return { msg: '문의사항 삭제 성공' };
  }

  @Delete('/:enquiryNo/reply')
  @ApiOperation({
    summary: '답변 삭제 API',
    description: '문의번호를 사용해 해당 문의사항의 답변을 삭제한다.',
  })
  async deleteReply(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
  ): Promise<APIResponse> {
    await this.enquiriesService.deleteReplyByEnquiryNo(enquiryNo);

    return { msg: '답변 삭제 성공' };
  }
}
