import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SetGuestMembersDto } from './dto/setGuestMembers.dto';
import { GuestMembersRepository } from './repository/guest-members.repository';
import { HostMembersRepository } from './repository/host-members.repository';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(GuestMembersRepository)
    private readonly guestMembersRepository: GuestMembersRepository,

    @InjectRepository(HostMembersRepository)
    private readonly hostMembersRepository: HostMembersRepository,
  ) {}

  async setGuestMembers(setGuestMembersDto: SetGuestMembersDto): Promise<void> {
    try {
      const { meetingNo, guest }: SetGuestMembersDto = setGuestMembersDto;
      const guestsInfo: object[] = guest.reduce((values, userNo) => {
        values.push({ meetingNo, userNo });
        return values;
      }, []);

      const setGuestResult: number =
        await this.guestMembersRepository.saveGuestMembers(guestsInfo);
      if (setGuestResult !== guest.length) {
        throw new InternalServerErrorException(
          `약속 host 데이터 추가 오류입니다`,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
