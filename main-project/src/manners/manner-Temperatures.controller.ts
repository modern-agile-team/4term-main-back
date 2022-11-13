import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateMannerTemperatureDto } from './dto/update-manner-temperature.dto';
import { MannerTemperaturesService } from './manner-Temperatures.service';

@Controller('manner-temperatures')
@ApiTags('매너온도 API')
export class MannersTemperatureController {
  constructor(private mannerTemperatureService: MannerTemperaturesService) {}
  // Get methods
  @Get('/:userProfileNo')
  @ApiOperation({
    summary: '매너온도 조회 API',
    description: '사용자의 매너온도를 조회한다.',
  })
  async getMannerTemperatureByNo(
    @Param('userProfileNo') userProfileNo: number,
  ): Promise<object> {
    try {
      const Temperature: object =
        await this.mannerTemperatureService.getMannerTemperatureByNo(
          userProfileNo,
        );
      const response = {
        success: true,
        manner: Temperature,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Post Methods
  @Post('/:userProfile')
  @ApiOperation({
    summary: '매너온도 생성 API',
    description:
      '유저 생성 시 작동되는 API 생성되는 유저의 매너온도를 기본 값으로 생성한다.',
  })
  async createMannerTemperature(
    @Param('userProfile', ParseIntPipe) userProfile: number,
  ): Promise<object> {
    try {
      const mannerTemperature: number =
        await this.mannerTemperatureService.createMannerTemperature(
          userProfile,
        );
      const response = { success: true, manner: mannerTemperature };

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Patch methods
  @Patch('/:userProfile')
  @ApiOperation({
    summary: '게시글 수정 API',
    description: '입력한 정보로 게시글, 멤버 정보을 수정한다.',
  })
  async updateBoard(
    @Param('userProfile', ParseIntPipe) userProfile: number,
    @Body() updateMannerTemperatureDto: UpdateMannerTemperatureDto,
  ): Promise<object> {
    try {
      const mannersTemperature: string =
        await this.mannerTemperatureService.updateMannerTemperature(
          userProfile,
          updateMannerTemperatureDto,
        );

      const response: object = {
        success: true,
        msg: mannersTemperature,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }
}
