import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { ParticipationDto } from './dto/participation.dto';
import { CreateBoardDto } from './dto/board.dto';
import { Boards } from './entity/board.entity';
import {
  Board,
  CreateResponse,
  Participation,
} from './interface/boards.interface';
import { BoardBookmarkRepository } from './repository/board-bookmark.repository';
import { BoardGuestRepository } from './repository/board-guest.repository';
import { BoardHostRepository } from './repository/board-host.repository';
import { BoardRepository } from './repository/board.repository';
import { BoardParticipationRepository } from './repository/board-participation.repository';
import { BoardFilterDto } from './dto/board-filter.dto';
import { EntityManager } from 'typeorm';
import { ResultSetHeader } from 'mysql2';

@Injectable()
export class BoardsService {
  constructor(
    private readonly boardBookmarkRepository: BoardBookmarkRepository,
    private readonly boardGuestRepository: BoardGuestRepository,
    private readonly boardHostRepository: BoardHostRepository,
    private readonly boardRepository: BoardRepository,
    private readonly noticeRepository: NoticesRepository,
    private readonly noticeBoardsRepository: NoticeBoardsRepository,
  ) {}
  //cron
  async closeThunder(): Promise<void> {
    const thunders: { no: string } = await this.boardRepository.checkDeadline();

    const no: number[] = JSON.parse(thunders.no);

    await this.boardRepository.closeBoard(no);
  }

  // 생성 관련
  async createBoard(
    manager: EntityManager,
    { hostMembers, userNo, ...newboard }: CreateBoardDto,
  ): Promise<void> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardRepository)
      .createBoard(userNo, newboard);

    const hostArr: object[] = await this.validateHosts(
      insertId,
      userNo,
      hostMembers,
    );

    await this.setHosts(manager, hostArr);
  }

  private async setHosts(
    manager: EntityManager,
    hostArr: object[],
  ): Promise<void> {
    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(BoardHostRepository)
      .createHosts(hostArr);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `board-host-members 생성(setHosts-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async validateHosts(
    boardNo: number,
    userNo: number,
    hosts: number[],
  ): Promise<object[]> {
    hosts.unshift(userNo);
    // TODO: user 확인 로직 추가
    const hostArr: object[] = hosts.map((el: number) => {
      return { boardNo, userNo: el };
    });

    return hostArr;
  }

  async createParticipation(
    manager: EntityManager,
    boardNo: number,
    participationDto: ParticipationDto,
  ): Promise<void> {
    const board: Board = await this.getBoardByNo(boardNo);
    // TODO: newGuest user 확인 로직 추가

    const { guests, ...participation }: ParticipationDto = participationDto;
    const { male, female }: Board = board;

    if (female + male != guests.length) {
      throw new BadRequestException(
        `참가 신청(createAplication-service): 신청 인원과 모집인원이 맞지 않습니다.`,
      );
    }

    await this.validateGuests(board, guests);
    const teamNo: number = await this.setParticipation(manager, {
      ...participation,
      boardNo,
    });
    await this.setGuests(manager, teamNo, guests);

    await this.saveNoticeParticipation(
      boardNo,
      guests[0],
      board.userNo,
      manager,
    );
  }

  private async validateGuests(
    board: Board,
    newGuests: number[],
  ): Promise<void> {
    const preGuests: Pick<Boards, 'userNo'>[] =
      await this.boardGuestRepository.getAllGuestsByBoardNo(board.no);

    const hosts = board.hostUserNums.split(',').map(Number);
    const guests = preGuests.map((el) => el.userNo);

    for (let no in newGuests) {
      if (hosts.includes(newGuests[no]) || guests.includes(newGuests[no])) {
        throw new BadRequestException(
          `참가자 확인(validateGuests-service): ${newGuests[no]}번 참가자의 잘못된 신청.`,
        );
      }
    }
  }

  private async setParticipation(
    manager: EntityManager,
    participation: Participation,
  ): Promise<void> {
    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(BoardParticipationRepository)
      .createParticipation(participation);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `board-participation 생성(setParticipation-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async setGuests(
    manager: EntityManager,
    teamNo: number,
    guests: number[],
  ): Promise<void> {
    const guestArr: object[] = guests.map((el: number) => {
      return { teamNo, userNo: el };
    });

    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(BoardGuestRepository)
      .createGuests(guestArr);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `board-guests 생성(setGuests-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createBookmark(boardNo: number, userNo: number): Promise<void> {
    await this.boardBookmarkRepository.createBookmark(boardNo, userNo);
  }

  // 조회 관련
  async getBoards(filter: BoardFilterDto): Promise<Board[]> {
    const boards: Board[] = await this.boardRepository.getBoards(filter);

    if (!boards.length) {
      throw new NotFoundException(
        `게시글 전체 조회(getAllBoards-service): 게시글이 없습니다.`,
      );
    }

    return boards;
  }

  async getBoardByNo(boardNo: number): Promise<Board> {
    const board: Board = await this.boardRepository.getBoardByNo(boardNo);

    if (!board.no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoardByNo-service): ${boardNo}번 게시글이 없습니다.`,
      );
    }

    return board;
  }

  // 수정 관련
  async editBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    // TODO: userNo -> jwt로 빠질 예정
    { hostMembers, ...newBoard }: Omit<CreateBoardDto, 'userNo'>,
  ): Promise<void> {
    await this.getBoardByNo(boardNo);

    const hosts: object[] = await this.validateHosts(
      boardNo,
      userNo,
      hostMembers,
    );

    await this.updateBoard(manager, boardNo, newBoard);
    await this.deleteHosts(manager, boardNo);
    await this.setHosts(manager, hosts);
  }

  private async updateBoard(
    manager: EntityManager,
    boardNo: number,
    newBoard: Partial<CreateBoardDto>,
  ): Promise<void> {
    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(BoardRepository)
      .updateBoard(boardNo, newBoard);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `게시글 수정(updateBoard-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async deleteHosts(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(BoardHostRepository)
      .deleteHosts(boardNo);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `게시글 수정(deleteHosts-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteBoardByNo(boardNo: number): Promise<void> {
    await this.getBoardByNo(boardNo);

    const { affectedRows }: ResultSetHeader =
      await this.boardRepository.deleteBoard(boardNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `게시글 삭제(deleteBoardByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async cancelBookmark(boardNo: number, userNo: number): Promise<void> {
    await this.getBoardByNo(boardNo);
    // TODO: user확인 메서드
    const { affectedRows }: ResultSetHeader =
      await this.boardBookmarkRepository.cancelBookmark(boardNo, userNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `북마크 삭제(cancelBookmark-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 알람 생성
  private async saveNoticeParticipation(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    targetUserNo: number,
  ): Promise<void> {
    const type = NoticeType.GUEST_APPLICATION;

    const { insertId }: InsertRaw = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({ userNo, type, targetUserNo });

    await manager
      .getCustomRepository(NoticeBoardsRepository)
      .saveNoticeBoard(insertId, boardNo);
  }
}
