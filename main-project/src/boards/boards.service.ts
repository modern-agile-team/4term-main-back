import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, QueryRunner, UpdateResult } from 'typeorm';
import { ParticipationDto } from './dto/participation.dto';
import { BoardDto } from './dto/board.dto';
import { BoardHosts } from './entity/board-host.entity';
import { Boards } from './entity/board.entity';
import { Board, CreateResponse } from './interface/boards.interface';
import { BoardBookmarkRepository } from './repository/board-bookmark.repository';
import { BoardParticipationRepository } from './repository/board-participation.repository';
import { BoardHostRepository } from './repository/board-host.repository';
import { BoardRepository, TestUserRepo } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardBookmarkRepository)
    private readonly boardBookmarkRepository: BoardBookmarkRepository,

    @InjectRepository(BoardParticipationRepository)
    private readonly boardGuestRepository: BoardParticipationRepository,

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
  ) {}

  // 생성 관련
  async createBoard({
    hostMembers,
    userNo,
    ...newboard
  }: BoardDto): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const boardNo: number = await queryRunner.manager
        .getCustomRepository(BoardRepository)
        .createBoard(userNo, newboard);
      const hostArr: object[] = await this.validateHosts(
        boardNo,
        userNo,
        hostMembers,
      );

      await this.setHosts(queryRunner, hostArr);

      await queryRunner.commitTransaction();

      return boardNo;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async setHosts(
    queryRunner: QueryRunner,
    hostArr: object[],
  ): Promise<void> {
    const { affectedRows }: CreateResponse = await queryRunner.manager
      .getCustomRepository(BoardHostRepository)
      .createHosts(hostArr);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `board-host-members 생성(setHosts): 알 수 없는 서버 에러입니다.`,
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
    boardNo: number,
    { guests }: ParticipationDto,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const board: Board = await this.getBoardByNo(boardNo);
      // TODO: newGuest user 확인 로직 추가
      const recruits: number = board.female + board.male;

      if (recruits != guests.length) {
        throw new BadRequestException(
          `참가 신청(createAplication): 신청 인원과 모집인원이 맞지 않습니다.`,
        );
      }

      const guestArr: object[] = await this.validateGuests(boardNo, guests);

      await queryRunner.manager
        .getCustomRepository(BoardParticipationRepository)
        .createGuestMembers(guestArr);

      await this.saveNoticeApplication(
        boardNo,
        guests[0],
        board.userNo,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return `${boardNo}번 게시글 참가 신청 완료`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async validateGuests(
    boardNo: number,
    newGuests: number[],
  ): Promise<object[]> {
    const preGuests: Pick<Boards, 'userNo'>[] =
      await this.boardGuestRepository.getAllGuestsByBoardNo(boardNo);
    const board: Board = await this.getBoardByNo(boardNo);

    const hosts = board.hostUserNums.split(',').map(Number);
    const guests = preGuests.map((el) => el.userNo);

    for (let no in newGuests) {
      if (hosts.includes(newGuests[no]) || guests.includes(newGuests[no])) {
        throw new BadRequestException(
          `참가자 확인(validateGuests): ${newGuests[no]}번 참가자의 잘못된 신청.`,
        );
      }
    }

    const guestArr: object[] = newGuests.map((el: number) => {
      return { boardNo, userNo: el };
    });

    return guestArr;
  }

  async createBookmark(boardNo: number, userNo: number): Promise<string> {
    await this.boardBookmarkRepository.createBookmark(boardNo, userNo);

    return '북마크 생성 성공';
  }

  // 조회 관련
  async getAllBoards(): Promise<Board[]> {
    const boards: Board[] = await this.boardRepository.getAllBoards();

    if (boards.length === 0) {
      throw new NotFoundException(
        `게시글 전체 조회(getAllBoards): 게시글이 없습니다.`,
      );
    }

    return boards;
  }

  async getBoardByNo(boardNo: number): Promise<Board> {
    const board: Board = await this.boardRepository.getBoardByNo(boardNo);

    if (!board.no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoardByNo): ${boardNo}번 게시글이 없습니다.`,
      );
    }

    return board;
  }

  // 수정 관련
  async editBoard(
    boardNo: number,
    userNo: number,
    // TODO: userNo -> jwt로 빠질 예정
    { hostMembers, ...newBoard }: Omit<BoardDto, 'userNo'>,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getBoardByNo(boardNo);
      const hosts: object[] = await this.validateHosts(
        boardNo,
        userNo,
        hostMembers,
      );

      await this.updateBoard(queryRunner, boardNo, newBoard);
      await this.deleteHosts(queryRunner, boardNo);
      await this.setHosts(queryRunner, hosts);

      await queryRunner.commitTransaction();

      return `${boardNo}번 게시글이 수정되었습니다.`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async updateBoard(
    queryRunner: QueryRunner,
    boardNo: number,
    newBoard: Partial<BoardDto>,
  ): Promise<void> {
    const affected: number = await queryRunner.manager
      .getCustomRepository(BoardRepository)
      .updateBoard(boardNo, newBoard);

    if (!affected) {
      throw new InternalServerErrorException(
        `게시글 수정(updateBoard): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async deleteHosts(
    queryRunner: QueryRunner,
    boardNo: number,
  ): Promise<void> {
    const affected: number = await queryRunner.manager
      .getCustomRepository(BoardHostRepository)
      .deleteHosts(boardNo);

    if (!affected) {
      throw new InternalServerErrorException(
        `게시글 수정(deleteHosts): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteBoardByNo(boardNo: number): Promise<string> {
    await this.getBoardByNo(boardNo);

    const board: number = await this.boardRepository.deleteBoard(boardNo);

    if (!board) {
      throw new BadRequestException(
        `게시글 삭제(deleteBoardByNo): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${boardNo}번 게시글 삭제 성공`;
  }

  async cancelBookmark(boardNo: number, userNo: number): Promise<string> {
    await this.getBoardByNo(boardNo);
    // TODO: user확인 메서드
    const bookMark: number = await this.boardBookmarkRepository.cancelBookmark(
      boardNo,
      userNo,
    );

    if (!bookMark) {
      throw new BadRequestException(
        `북마크 삭제(cancelBookmark): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${boardNo}번 게시글 ${userNo}번 user 북마크 삭제 성공 :)`;
  }

  // 알람 생성
  private async saveNoticeApplication(
    no: number,
    userNo: number,
    targetUserNo: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const type = NoticeType.GUEST_APPLICATION;

    const { insertId }: InsertRaw = await queryRunner.manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({ userNo, type, targetUserNo });

    await queryRunner.manager
      .getCustomRepository(NoticeBoardsRepository)
      .saveNoticeBoard(insertId, no);
  }
}
