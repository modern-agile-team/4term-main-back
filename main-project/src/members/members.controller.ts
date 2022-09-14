import { Body, Controller, Post } from '@nestjs/common';
import { SetGuestMembersDto } from './dto/setGuestMembers.dto';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('/guest')
  async setGuestMembers(
    @Body() setGuestMembersDto: SetGuestMembersDto,
  ): Promise<object> {
    await this.membersService.setGuestMembers(setGuestMembersDto);

    return { success: true, msg: `게스트가 추가되었습니다` };
  }
}
