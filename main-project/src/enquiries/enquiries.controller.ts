import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { EnquiryDto } from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) {}

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
    const enquiry: number = await this.enquiriesService.createEnquiry(
      enquiryDto,
      userNo,
    );
    const response = { success: true, enquiry };

    return response;
  }
}
