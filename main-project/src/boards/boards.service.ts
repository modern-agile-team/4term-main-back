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
import {
  JsonBoard,
  Guest,
  GuestTeam,
  Board,
} from './interface/boards.interface';
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
import { JsonArray } from 'src/common/interface/interface';

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
    const boards: JsonArray = await manager
      .getCustomRepository(BoardsRepository)
      .checkDeadline();

    const no: number[] = JSON.parse(boards.no);

    await manager.getCustomRepository(BoardsRepository).closeBoard(no);
  }

  // 조회 관련
  async getBoards(
    manager: EntityManager,
    filter: BoardFilterDto,
  ): Promise<JsonBoard[]> {
    const boards: JsonBoard[] = await manager
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
    const { no, hostMembers, hostMembersNickname, ...jsonBoard }: JsonBoard =
      await manager.getCustomRepository(BoardsRepository).getBoardByNo(boardNo);

    const parsingHostMembers: number[] = JSON.parse(hostMembers);
    const parsingHostMembersNickname: number[] =
      JSON.parse(hostMembersNickname);

    if (!no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoardByNo-service): ${boardNo}번 게시글이 없습니다.`,
      );
    }
    const board: Board = {
      hostMembers: parsingHostMembers,
      hostMembersNickname: parsingHostMembersNickname,
      ...jsonBoard,
    };
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

    const { recruitMale, recruitFemale, hostUserNo, hostMembers }: Board =
      await this.getBoardByNo(manager, boardNo);

    if (recruitMale + recruitFemale != guests.length) {
      throw new BadRequestException(
        `참가 신청(createGuestTeam-service): 신청 인원과 모집인원이 맞지 않습니다.`,
      );
    }

    await this.validateGuests(manager, boardNo, hostMembers, guests);

    // const teamNo: number = await this.setGuestTeam(manager, {
    //   ...participation,
    //   boardNo,
    // });
    // await this.setGuests(manager, teamNo, guests);
    // await this.saveNoticeParticipation(manager, boardNo, guests[0], hostUserNo);
  }

  private async validateGuests(
    manager: EntityManager,
    boardNo: number,
    hosts: number[],
    newGuests: number[],
  ): Promise<void> {
    await this.validateUsers(manager, newGuests);
    const preGuests: number[] = await this.getPreGuests(manager, boardNo);
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

  private async getPreGuests(
    manager: EntityManager,
    boardNo: number,
  ): Promise<number[]> {
    const { userNo }: JsonArray = await manager
      .getCustomRepository(BoardGuestsRepository)
      .getAllGuestsByBoardNo(boardNo);

    const preGuests = !userNo ? [] : JSON.parse(userNo);

    return preGuests;
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
    const guestArr: Guest[] = guests.map((el: number) => {
      return { teamNo, userNo: el };
    });
    // TODO: type 정리

    await manager
      .getCustomRepository(BoardGuestsRepository)
      .createGuests(guestArr);
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
    await this.getBoardByNo(manager, boardNo);
    // 사용자 확인 로직

    await this.updateBoard(manager, boardNo, updateBoardDto);
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

  private async deleteHosts(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardHostsRepository)
      .deleteHosts(boardNo);
  }

  // 삭제 관련
  async deleteBoardByNo(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await this.getBoardByNo(manager, boardNo);

    await this.boardRepository.deleteBoard(boardNo);
  }

  async cancelBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getBoardByNo(manager, boardNo);
    // TODO: user확인 메서드
    await this.boardBookmarkRepository.cancelBookmark(boardNo, userNo);
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

  // function
  private async validateUsers(
    manager: EntityManager,
    userArr: number[],
  ): Promise<void> {
    const { no } = await manager
      .getCustomRepository(UsersRepository)
      .getUsersByNums(userArr);

    const users = JSON.parse(no);

    const isUser = userArr.filter((userNo) => {
      return !users.includes(userNo);
    });

    if (isUser.length) {
      throw new BadRequestException(`${isUser}번 유저가 없습니다.`);
    }
  }
}
