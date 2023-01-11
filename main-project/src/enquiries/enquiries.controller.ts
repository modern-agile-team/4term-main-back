import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { APIResponse } from 'src/common/interface/interface';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiriesService } from './enquiries.service';
import { Enquiries } from './entity/enquiry.entity';

@Controller('enquiries')
@ApiTags('문의사항 API')
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) {}
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

    return { response: { enquiry } };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '문의사항 생성 API',
    description: '입력한 정보로 문의사항을 생성한다.',
  })
  // TODO: @GetUser 사용법 문의
  async createEnquiry(
    @GetUser() userNo: number,
    @Body()
    enquiryDto: CreateEnquiryDto,
  ): Promise<APIResponse> {
    await this.enquiriesService.createEnquiry(enquiryDto, userNo);

    return { response: { msg: '문의사항 생성 성공' } };
  }

  // Patch Methods
  @Patch('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 수정 API',
    description: '입력한 정보로 문의 내용을 수정한다.',
  })
  async updateEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<APIResponse> {
    await this.enquiriesService.updateEnquiry(enquiryNo, updateEnquiryDto);

    return { response: { msg: '문의사항 수정 성공' } };
  }

  // Delete Methods
  @Delete('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 삭제 API',
    description: '문의번호를 사용해 해당 문의사항을 삭제한다.',
  })
  async deleteEnquiry(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
  ): Promise<APIResponse> {
    await this.enquiriesService.deleteEnquiryByNo(enquiryNo);

    return { response: { msg: '문의사항 삭제 성공' } };
  }
}
