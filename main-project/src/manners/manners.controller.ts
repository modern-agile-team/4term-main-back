import {
  Body,
  Controller,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { EntityManager } from 'typeorm';
import { UpdateMannerDto } from './dto/update-manner.dto';
import { MannersService } from './manners.service';
import { ApiUpdateManner } from './swagger-decorator/update-manner.decorator';

@ApiTags('매너 API')
@Controller('manners')
export class MannersController {
  constructor(private mannersService: MannersService) {}

  @ApiUpdateManner()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Patch()
  async updateManner(
    @GetUser() userNo: number,
    @Body() updateMannerDto: UpdateMannerDto,
    @TransactionDecorator() manager: EntityManager,
  ) {
    await this.mannersService.updateManner(userNo, updateMannerDto, manager);

    return { msg: '평점 저장 성공' };
  }
}
