import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { CreateGuestTeamDto } from './dto/create-guest-team.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { Guest, GuestTeam, Board } from './interface/boards.interface';
import { BoardBookmarksRepository } from './repository/board-bookmark.repository';
import { BoardGuestsRepository as BoardGuestsRepository } from './repository/board-guest.repository';
import { BoardHostsRepository } from './repository/board-host.repository';
import { BoardsRepository } from './repository/board.repository';
import { BoardGuestTeamsRepository } from './repository/board-guest-team.repository';
import { BoardFilterDto } from './dto/board-filter.dto';
import { EntityManager } from 'typeorm';
import { ResultSetHeader } from 'mysql2';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UsersRepository } from 'src/users/repository/users.repository';

@Injectable()
export class BoardsService {
  constructor(
    private readonly boardBookmarkRepository: BoardBookmarksRepository,
    private readonly boardGuestRepository: BoardGuestsRepository,
    private readonly boardHostRepository: BoardHostsRepository,
    private readonly boardRepository: BoardsRepository,

    private readonly noticeRepository: NoticesRepository,
    private readonly noticeBoardsRepository: NoticeBoardsRepository,

    private readonly usersRepository: UsersRepository,
  ) {}
  //cron
  async closeBoard(manager: EntityManager): Promise<void> {
    const boards: number[] = await manager
      .getCustomRepository(BoardsRepository)
      .checkDeadline();

    await manager.getCustomRepository(BoardsRepository).closeBoard(boards);
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

  async getBoard(manager: EntityManager, boardNo: number): Promise<Board> {
    const board: Board = await manager
      .getCustomRepository(BoardsRepository)
      .getBoard(boardNo);

    if (!board.no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoard-service): ${boardNo}번 게시글이 없습니다.`,
      );
    }
    return board;
  }

  // 생성 관련
  async createBoard(
    manager: EntityManager,
    userNo: number,
    { hostMembers, ...board }: CreateBoardDto,
  ): Promise<void> {
    await this.validateUsers(manager, hostMembers);
    const boardNo: number = await this.setBoard(manager, userNo, board);

    hostMembers.push(userNo);
    await this.setHosts(manager, boardNo, hostMembers);
  }

  private async setBoard(
    manager: EntityManager,
    userNo: number,
    newboard: Omit<CreateBoardDto, 'hostMembers'>,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardsRepository)
      .createBoard(userNo, newboard);

    return insertId;
  }

  private async setHosts(
    manager: EntityManager,
    boardNo: number,
    hostArr: number[],
  ): Promise<void> {
    const hosts = hostArr.map((userNo) => {
      return { boardNo, userNo };
    });

    await manager.getCustomRepository(BoardHostsRepository).createHosts(hosts);
  }

  async createGuestTeam(
    manager: EntityManager,
    boardNo: number,
    createGuestTeamDto: CreateGuestTeamDto,
  ): Promise<void> {
    const { guests, ...participation }: CreateGuestTeamDto = createGuestTeamDto;
    const { recruitMale, recruitFemale, hostUserNo, hostMemberNums }: Board =
      await this.getBoard(manager, boardNo);

    if (recruitMale + recruitFemale != guests.length) {
      throw new BadRequestException(
        `참가 신청(createGuestTeam-service): 신청 인원과 모집인원이 맞지 않습니다.`,
      );
    }

    await this.validateGuests(manager, boardNo, hostMemberNums, guests);

    const teamNo: number = await this.setGuestTeam(manager, {
      ...participation,
      boardNo,
    });
    await this.setGuests(manager, teamNo, guests);
    await this.saveNoticeGuestTeam(manager, boardNo, guests[0], hostUserNo);
  }

  private async validateGuests(
    manager: EntityManager,
    boardNo: number,
    hosts: number[],
    newGuests: number[],
  ): Promise<void> {
    await this.validateUsers(manager, newGuests);

    const preGuests: number[] = await manager
      .getCustomRepository(BoardGuestsRepository)
      .getAllGuestsByBoardNo(boardNo);
    const wrongUser: number[] = [];

    for (let no in newGuests) {
      if (hosts.includes(newGuests[no]) || preGuests.includes(newGuests[no])) {
        wrongUser.push(newGuests[no]);
      }
    }

    if (wrongUser.length) {
      throw new BadRequestException(
        `참가자 확인(validateGuests-service): ${wrongUser}번 참가자의 잘못된 신청.`,
      );
    }
  }

  private async setGuestTeam(
    manager: EntityManager,
    guestTeam: GuestTeam,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .createGuestTeam(guestTeam);

    return insertId;
  }

  private async setGuests(
    manager: EntityManager,
    teamNo: number,
    guests: number[],
  ): Promise<void> {
    const multipleGuests: Guest[] = guests.map((el: number) => {
      return { teamNo, userNo: el };
    });

    await manager
      .getCustomRepository(BoardGuestsRepository)
      .createGuests(multipleGuests);
  }

  async createBookmark(boardNo: number, userNo: number): Promise<void> {
    await this.boardBookmarkRepository.createBookmark(boardNo, userNo);
  }

  // 수정 관련
  async editBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    await this.validateBoardInfo(manager, boardNo, userNo, updateBoardDto);
    await this.updateBoard(manager, boardNo, updateBoardDto);
  }

  private async validateBoardInfo(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    const board: Board = await this.getBoard(manager, boardNo);
    await this.validateHost(board.hostUserNo, userNo);
    await this.validateRecruits(manager, board, updateBoardDto);
  }

  private async updateBoard(
    manager: EntityManager,
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardsRepository)
      .updateBoard(boardNo, updateBoardDto);
  }

  // 삭제 관련
  async deleteBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    const { hostUserNo }: Board = await this.getBoard(manager, boardNo);
    await this.validateHost(hostUserNo, userNo);
    await this.removeBoard(manager, boardNo);
  }

  private async removeBoard(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await manager.getCustomRepository(BoardsRepository).deleteBoard(boardNo);
  }

  async cancelBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getBoard(manager, boardNo);
    // TODO: user확인 메서드
    await this.boardBookmarkRepository.cancelBookmark(boardNo, userNo);
  }

  // 알람 생성
  private async saveNoticeGuestTeam(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    targetUserNo: number,
  ): Promise<void> {
    const type = NoticeType.GUEST_REQUEST;

    const { insertId }: InsertRaw = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({ userNo, type, targetUserNo });

    await manager
      .getCustomRepository(NoticeBoardsRepository)
      .saveNoticeBoard(insertId, boardNo);
  }

  // function
  private async validateUsers(
    manager: EntityManager,
    users: number[],
  ): Promise<void> {
    const dbUsers: number[] = await manager
      .getCustomRepository(UsersRepository)
      .getUsersByNums(users);
    if (!dbUsers.length) {
      throw new BadRequestException(`${users}번 유저가 없습니다.`);
    }

    const isUser = users.filter((userNo) => !dbUsers.includes(userNo));
    if (isUser.length) {
      throw new BadRequestException(`${isUser}번 유저가 없습니다.`);
    }
  }

  private async validateHost(
    hostUserNo: number,
    userNo: number,
  ): Promise<void> {
    if (userNo != hostUserNo) {
      throw new BadRequestException(
        `작성자 검증 (validateHost-service): 작성자와 사용자가 일치하지 않습니다.`,
      );
    }
  }

  private async validateRecruits(
    manager: EntityManager,
    board: Board,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    const guests: number[] = await manager
      .getCustomRepository(BoardGuestsRepository)
      .getAllGuestsByBoardNo(board.no);

    if (
      guests.length &&
      (updateBoardDto.recruitFemale != board.recruitFemale ||
        updateBoardDto.recruitMale != board.recruitMale)
    ) {
      throw new BadRequestException(
        '모집인원 검증(validateRecruits-service): 참가 신청이 존재 시 모집인원을 변경할 수 없습니다.',
      );
    }
  }
}
