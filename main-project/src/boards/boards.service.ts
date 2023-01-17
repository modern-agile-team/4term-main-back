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
import { CreateBoardDto } from './dto/create-board.dto';
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
    const boards: { no: string } = await manager
      .getCustomRepository(BoardsRepository)
      .checkDeadline();

    const no: number[] = JSON.parse(boards.no);

    await manager.getCustomRepository(BoardsRepository).closeBoard(no);
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
    const teamNo: number = await this.setGuestTeam(manager, {
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

  private async setGuestTeam(
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
