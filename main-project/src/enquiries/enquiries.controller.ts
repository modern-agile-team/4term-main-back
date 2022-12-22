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
import { ApiOperation } from '@nestjs/swagger';
import { EnquiryDto } from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';
import { EnquiryIF } from './interface/enquiry.interface';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) { }
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '문의사항 전체 조회 API',
    description: '문의사항 전부를 내림차순으로 조회한다.',
  })
  async getAllEnquiries(): Promise<object> {
    const response: EnquiryIF[] =
      await this.enquiriesService.getAllEnquiries();


    return { response };
  }

  @Get('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 상세 조회 API',
    description: '문의 번호를 통해 문의사항을 상세 조회한다.',
  })
  async getEnquiriesByNo(
    @Param('enquiryNo') enquiryNo: number,
  ): Promise<object> {
    const response: EnquiryIF =
      await this.enquiriesService.getEnquiriesByNo(enquiryNo);

    return { response };
  }

  // Post Methods
  @Post('/:userNo')
  @ApiOperation({
    summary: '문의사항 생성 API',
    description: '입력한 정보로 문의사항을 생성한다.',
  })
  async createBoard(
    @Param('userNo') userNo: number,
    @Body() enquiryDto: EnquiryDto,
  ): Promise<object> {
    const response: number = await this.enquiriesService.createEnquiry(
      enquiryDto,
      userNo,
    );

    return { response };
  }

  // Patch Methods
  @Patch('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 수정 API',
    description: '입력한 정보로 문의 내용을 수정한다.',
  })
  async updateBoard(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
    @Body() enquiryDto: EnquiryDto,
  ): Promise<object> {
    const response: string = await this.enquiriesService.updateEnquiry(
      enquiryNo,
      enquiryDto,
    );

    return { response };
  }

  // Delete Methods
  @Delete('/:enquiryNo')
  @ApiOperation({
    summary: '문의사항 삭제 API',
    description: '문의번호를 사용해 해당 문의사항을 삭제한다.',
  })
  async deleteBoard(
    @Param('enquiryNo', ParseIntPipe) enquiryNo: number,
  ): Promise<object> {
    const response = await this.enquiriesService.deleteEnquiryByNo(enquiryNo);

    return { response };
  }
}
