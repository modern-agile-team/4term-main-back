import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, QueryRunner } from 'typeorm';
import { ApplicationDto } from './dto/application.dto';
import { BoardDto } from './dto/board.dto';
import { BoardMemberInfos } from './entity/board-member-info.entity';
import { Boards } from './entity/board.entity';
import { BoardIF } from './interface/boards.interface';
import { BoardBookmarkRepository } from './repository/board-bookmark.repository';
import { BoardGuestRepository } from './repository/board-guest.repository';
import { BoardHostRepository } from './repository/board-host.repository';
import { BoardMemberInfoRepository } from './repository/board-member-info.repository';
import { BoardRepository, TestUserRepo } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardBookmarkRepository)
    private readonly boardBookmarkRepository: BoardBookmarkRepository,

    @InjectRepository(BoardMemberInfoRepository)
    private readonly boardMemberInfoRepository: BoardMemberInfoRepository,

    @InjectRepository(BoardGuestRepository)
    private readonly boardGuestRepository: BoardGuestRepository,

    @InjectRepository(BoardHostRepository)
    private readonly boardHostRepository: BoardHostRepository,

    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,

    @InjectRepository(NoticesRepository)
    private readonly noticeRepository: NoticesRepository,

    @InjectRepository(NoticeBoardsRepository)
    private readonly noticeBoardsRepository: NoticeBoardsRepository,

    private readonly connection: Connection,

    // TODO: user module 작업 되면 삭제
    @InjectRepository(TestUserRepo)
    private readonly testUserRepo: TestUserRepo,
  ) { }

  // 생성 관련
  async createBoard({ hostMembers, userNo, ...newboard }: BoardDto): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const boardNo: number = await queryRunner.manager.getCustomRepository(BoardRepository).createBoard(userNo, newboard);
      const hostArr: object[] = await this.validateHosts(boardNo, userNo, hostMembers)

      await queryRunner.manager.getCustomRepository(BoardHostRepository).createHostMember(hostArr);
      await queryRunner.manager.getCustomRepository(BoardMemberInfoRepository).createBoardMember(boardNo, newboard);

      await queryRunner.commitTransaction();

      return boardNo;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async validateHosts(boardNo: number, userNo: number, hosts: number[]): Promise<object[]> {
    hosts.push(userNo);
    // TODO: user 확인 로직 추가
    const hostArr: object[] = await this.setArray(boardNo, hosts)

    return hostArr;
  }

  async createAplication(boardNo: number, applicationDto: ApplicationDto): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const board: BoardIF = await this.getBoardByNo(boardNo)
      const recruits: number = board.female + board.male;

      if (recruits != applicationDto.guests.length) {
        throw new BadRequestException(`신청 인원과 모집 인원이 맞지 않습니다.`)
      }

      const guestArr: object[] = await this.validateGuests(boardNo, applicationDto.guests)
      await queryRunner.manager.getCustomRepository(BoardGuestRepository).createGuestMembers(guestArr);
      await this.saveNoticeApplication(boardNo);

      await queryRunner.commitTransaction();

      return `${boardNo}번 게시글 참가 신청 완료`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error
    } finally {
      await queryRunner?.release();
    }
  }

  private async validateGuests(boardNo: number, newGuests: number[]): Promise<object[]> {
    const data: Pick<Boards, 'userNo'>[] = await this.boardGuestRepository.getAllGuestsByBoardNo(boardNo)
    const guests = data.map((el) => el.userNo)

    if (data.length === 0) {
      return this.setArray(boardNo, newGuests)
    }

    const board: BoardIF = await this.getBoardByNo(boardNo)
    const hosts = board.hostUserNums.split(',').map(Number);

    // TODO: newGuest user 확인 로직 추가
    for (let no in newGuests) {
      if (guests.includes(newGuests[no])) {
        throw new BadRequestException(`${newGuests[no]}참가자의 중복 신청`)
      }
      if (hosts.includes(newGuests[no])) {
        throw new BadRequestException(`${newGuests[no]}번 host의 잘못된 참가 신청`)
      }
    }

    const guestArr: object[] = await this.setArray(boardNo, newGuests);

    return guestArr;
  }

  private async setArray(boardNo: number, arr: number[]): Promise<object[]> {
    return arr.map((el: number) => {
      return { boardNo, userNo: el }
    })
  }

  async createBookmark(boardNo: number, userNo: number): Promise<string> {
    await this.boardBookmarkRepository.createBookmark(boardNo, userNo);

    return '북마크 생성 성공';
  }

  // 조회 관련
  async getAllBoards(): Promise<BoardIF[]> {
    const boards: BoardIF[] =
      await this.boardRepository.getAllBoards();

    if (boards.length === 0) {
      throw new NotFoundException(`게시글이 없습니다.`);
    }

    return boards;
  }

  async getBoardByNo(boardNo: number): Promise<BoardIF> {
    const board: BoardIF = await this.boardRepository.getBoardByNo(
      boardNo,
    );

    if (!board.no) {
      throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
    }

    return board;
  }

  // 수정 관련
  async editBoard(
    boardNo: number,
    { male, female, hostMembers, ...boardDetail }: BoardDto,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getBoardByNo(boardNo);

      const boardMember: Pick<BoardMemberInfos, 'female' | 'male'> = {
        male,
        female,
      };

      await queryRunner.manager.getCustomRepository(BoardRepository).updateBoard(boardNo, boardDetail);
      await queryRunner.manager.getCustomRepository(BoardMemberInfoRepository).updateBoardMember(boardNo, boardMember);
      // await queryRunner.manager.getCustomRepository(BoardHostRepository).updateHostMember(boardNo, hostMembers);
      return `${boardNo}번 게시글이 수정되었습니다.`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error
    } finally {
      await queryRunner?.release();
    }
  }
  // 삭제 관련
  async deleteBoardByNo(boardNo: number): Promise<string> {
    await this.getBoardByNo(boardNo);

    const board: number = await this.boardRepository.deleteBoard(boardNo);

    if (!board) {
      throw new NotFoundException(
        `${boardNo}번 게시글 삭제 에러 deleteBoardByNo-service`,
      );
    }
    return `${boardNo}번 게시글 삭제 성공`;
  }

  async cancelBookmark(boardNo: number, userNo: number): Promise<string> {
    await this.getBoardByNo(boardNo);
    await this.boardBookmarkRepository.cancelBookmark(boardNo, userNo);

    return `${boardNo}번 게시글 ${userNo}번 user 북마크 삭제 성공 :)`;
  }

  // 알람 생성
  private async saveNoticeApplication(boardNo: number): Promise<string> {
    const type = NoticeType.GUEST_APPLICATION;
    const board = await this.getBoardByNo(boardNo)

    const noticeNo = await this.noticeRepository.saveNoticeBoard({
      type,
      targetUserNo: board.userNo,
    });

    await this.noticeBoardsRepository.saveNoticeBoard(
      noticeNo,
      boardNo,
    );

    return `${board.no}번 게시글에 만남 신청 완료`;
  }
}
