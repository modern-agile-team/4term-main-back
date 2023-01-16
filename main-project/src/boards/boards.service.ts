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
import { Board, Participation } from './interface/boards.interface';
import { BoardBookmarksRepository } from './repository/board-bookmark.repository';
import { BoardGuestsRepository as BoardGuestsRepository } from './repository/board-guest.repository';
import { BoardHostsRepository } from './repository/board-host.repository';
import { BoardsRepository } from './repository/board.repository';
import { BoardGuestTeamsRepository } from './repository/board-guest-team.repository';
import { BoardFilterDto } from './dto/board-filter.dto';
import { EntityManager } from 'typeorm';
import { ResultSetHeader } from 'mysql2';

@Injectable()
export class BoardsService {
  constructor(
    private readonly boardBookmarkRepository: BoardBookmarksRepository,
    private readonly boardGuestRepository: BoardGuestsRepository,
    private readonly boardHostRepository: BoardHostsRepository,
    private readonly boardRepository: BoardsRepository,
    private readonly noticeRepository: NoticesRepository,
    private readonly noticeBoardsRepository: NoticeBoardsRepository,
  ) {}
  //cron
  async closeThunder(): Promise<void> {
    const thunders: { no: string } = await this.boardRepository.checkDeadline();

    const no: number[] = JSON.parse(thunders.no);

    await this.boardRepository.closeBoard(no);
  }

  // 조회 관련
  async getBoards(
    manager: EntityManager,
    filter: BoardFilterDto,
  ): Promise<Board[]> {
    const boards: Board[] = await manager
      .getCustomRepository(BoardsRepository)
      .getBoards(filter);

    if (!boards.length) {
      throw new NotFoundException(
        `게시글 전체 조회(getAllBoards-service): 게시글이 없습니다.`,
      );
    }

    return boards;
  }

  async getBoardByNo(manager: EntityManager, boardNo: number): Promise<Board> {
    const board: Board = await manager
      .getCustomRepository(BoardsRepository)
      .getBoardByNo(boardNo);

    board.hostMembers = JSON.parse(board.hostMembers);
    board.hostMembersNickname = JSON.parse(board.hostMembersNickname);

    if (!board.no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoardByNo-service): ${boardNo}번 게시글이 없습니다.`,
      );
    }

    return board;
  }

  // 생성 관련
  async createBoard(
    manager: EntityManager,
    { hostMembers, userNo, ...newboard }: CreateBoardDto,
  ): Promise<void> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardsRepository)
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
      .getCustomRepository(BoardHostsRepository)
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

  async createGuestTeam(
    manager: EntityManager,
    boardNo: number,
    participationDto: ParticipationDto,
  ): Promise<void> {
    const board: Board = await this.getBoardByNo(manager, boardNo);
    // TODO: newGuest user 확인 로직 추가

    const { guests, ...participation }: ParticipationDto = participationDto;
    const { recruitMale: male, recruitFemale: female }: Board = board;

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
      manager,
      boardNo,
      guests[0],
      board.hostUserNo,
    );
  }

  private async validateGuests(
    board: Board,
    newGuests: number[],
  ): Promise<void> {
    const preGuests: Pick<Boards, 'userNo'>[] =
      await this.boardGuestRepository.getAllGuestsByBoardNo(board.no);

    // const hosts = board.hostMembers.map(Number);
    // const guests = preGuests.map((el) => el.userNo);

    // for (let no in newGuests) {
    //   if (hosts.includes(newGuests[no]) || guests.includes(newGuests[no])) {
    //     throw new BadRequestException(
    //       `참가자 확인(validateGuests-service): ${newGuests[no]}번 참가자의 잘못된 신청.`,
    //     );
    //   }
    // }
  }

  private async setParticipation(
    manager: EntityManager,
    participation: Participation,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .createGuestTeam(participation);

    if (!insertId) {
      throw new InternalServerErrorException(
        `board-participation 생성(setParticipation-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
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
      .getCustomRepository(BoardGuestsRepository)
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

  // 수정 관련
  async editBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    // TODO: userNo -> jwt로 빠질 예정
    { hostMembers, ...newBoard }: Omit<CreateBoardDto, 'userNo'>,
  ): Promise<void> {
    await this.getBoardByNo(manager, boardNo);

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
    const isUpdated: number = await manager
      .getCustomRepository(BoardsRepository)
      .updateBoard(boardNo, newBoard);

    if (!isUpdated) {
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
      .getCustomRepository(BoardHostsRepository)
      .deleteHosts(boardNo);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `게시글 수정(deleteHosts-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteBoardByNo(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await this.getBoardByNo(manager, boardNo);

    const { affectedRows }: ResultSetHeader =
      await this.boardRepository.deleteBoard(boardNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `게시글 삭제(deleteBoardByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async cancelBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getBoardByNo(manager, boardNo);
    // TODO: user확인 메서드
    const isDeleted: number = await this.boardBookmarkRepository.cancelBookmark(
      boardNo,
      userNo,
    );

    if (!isDeleted) {
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
