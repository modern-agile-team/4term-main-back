import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { MannersRepository } from './repository/manners.repository';

@Injectable()
export class MannersService {
  constructor(
    @InjectRepository(MannersRepository)
    private readonly mannersRepository: MannersRepository,
    private readonly meetingRepository: MeetingRepository,
  ) {}

  async findMeetingByNo(meetingNo: number): Promise<any> {
    try {
      const meeting = await this.meetingRepository.findMeetingById(meetingNo);

      if (!meeting) {
        throw new NotFoundException(
          `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
        );
      }
      return meeting;
    } catch (error) {
      throw error;
    }
  }

  // async findAllMembers(boardNo: number) {
  //   try {
  //     const findAllMembers =
  //       await this.mannersRepository.findAllMembersByBoardNo();
  //     console.log(findAllMembers);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
