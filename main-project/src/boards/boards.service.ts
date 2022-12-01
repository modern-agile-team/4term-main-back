import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, QueryRunner } from 'typeorm';
import { BoardDto } from './dto/board.dto';
import { BoardGuests } from './entity/board-guest.entity';
import {
  BoardMemberDetail,
  CreateResponse,
  BoardReadResponse,
  BoardDetail,
  BoardAndUserNumber,
  GuestApplication,
  HostMembers,
} from './interface/boards.interface';
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

    // test repo 삭제 예정
    @InjectRepository(TestUserRepo)
    private readonly testUserRepo: TestUserRepo,

    private readonly connection: Connection,
  ) { }

  // 게시글 생성 관련
  private async setBoard({ queryRunner, userNo, ...boardInfo }: BoardDetail): Promise<number> {
    const board: BoardDetail = { ...boardInfo, userNo }
    const { affectedRows, insertId }: CreateResponse =
      await queryRunner.manager.getCustomRepository(BoardRepository).createBoard(board);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`board 생성 오류입니다.`);
    }

    return insertId;
  }

  private async setHostMembers(
    { queryRunner, boardNo, userNo, hosts }: HostMembers
  ): Promise<void> {
    hosts.push(userNo)

    for (let el in hosts) {
      const hostMember: BoardAndUserNumber = (Number(el) === hosts.length - 1) ? { boardNo, userNo } : { boardNo, userNo: Number(hosts[el]) };

      const { affectedRows }: CreateResponse =
        await queryRunner.manager.getCustomRepository(BoardHostRepository).createHostMember(hostMember);

      if (!(affectedRows)) {
        throw new InternalServerErrorException(`host-member 생성 오류입니다.`);
      }
    }
  }

  private async setBoardMember(

    { boardNo,
      queryRunner, ...boardInfo }: BoardMemberDetail,
  ): Promise<void> {
    const { affectedRows }: CreateResponse =
      await queryRunner.manager.getCustomRepository(BoardMemberInfoRepository).createBoardMember({ boardNo, ...boardInfo });

    if (!(affectedRows)) {
      throw new InternalServerErrorException(`board-member 생성 오류입니다.`);
    }
  }

  async createBoard({ hostMembers, userNo, ...boardInfo }: BoardDto): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const boardNo: number = await this.setBoard({ ...boardInfo, queryRunner, userNo });
      const hosts: number[] = await this.validateUsers(boardNo, hostMembers)

      const memberInfo: HostMembers = { queryRunner, boardNo, userNo, hosts }
      await this.setHostMembers(memberInfo); // transaction

      const boardMemberDetail: BoardMemberDetail = {
        ...boardInfo,
        boardNo,
        queryRunner
      };

      await this.setBoardMember(boardMemberDetail);

      await queryRunner.commitTransaction();

      return boardNo;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAplication({ boardNo, guests }: GuestApplication): Promise<number> {
    const board: BoardMemberDetail = await this.getBoardByNo(boardNo)
    const applicantCount: number = board.male + board.female;

    if (applicantCount != guests.length) {
      throw new BadRequestException(`신청 인원과 모집 인원이 맞지 않습니다.`)
    }

    const guestNums: number[] = await this.validateUsers(boardNo, guests)
    const guestMembers: void = await this.createGuestMembers(boardNo, guestNums);
    const notice = await this.saveNoticeApplication(boardNo);

    return notice;
  }

  private async validateUsers(boardNo: number, users: []): Promise<number[]> {
    const board = await this.boardRepository.find({ where: [boardNo] });
    const userArr: number[] = [];

    for (let index in users) {
      const user: any = await this.testUserRepo.getUserByNickname(users[index])
      if (!user) {
        throw new NotFoundException(`${users[index]} 사용자가 없습니다.`)
      }

      for (let idx in board) {
        if (board[idx].userNo === user.no) {
          throw new BadRequestException(`${users[index]} 사용자가 이미 신청 목록에 있습니다.`)
        }
      }
      userArr.push(user.no)
    }

    return userArr;
  }

  private async createGuestMembers(boardNo: number, guestNums: number[]): Promise<void> {
    for (let index in guestNums) {
      const guests: CreateResponse =
        await this.boardGuestRepository.createGuestMembers(boardNo, guestNums[index]);

      if (!guests) {
        throw new InternalServerErrorException(`guest-application 생성 오류입니다.`);
      }
    }
  }

  async createBookmark(bookmarkDetail: BoardAndUserNumber): Promise<number> {
    const { affectedRows, insertId }: CreateResponse =
      await this.boardBookmarkRepository.createBookmark(bookmarkDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`bookmark 생성 오류입니다.`);
    }

    return insertId;
  }

  // 게시글 조회 관련
  async getAllBoards(): Promise<BoardReadResponse[]> {
    const boards: BoardReadResponse[] =
      await this.boardRepository.getAllBoards();

    if (!boards) {
      throw new NotFoundException(`전체 게시글의 조회를 실패 했습니다.`);
    }

    return boards;
  }

  async getBoardByNo(boardNo: number): Promise<BoardReadResponse> {
    const board: BoardReadResponse = await this.boardRepository.getBoardByNo(
      boardNo,
    );

    if (!board) {
      throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
    }

    return board;
  }

  //게시글 수정 관련
  async editBoard(
    boardNo: number,
    { male, female, hostMembers, ...boardDetail }: BoardDto,
  ): Promise<string> {
    await this.getBoardByNo(boardNo);

    const boardMember: BoardMemberDetail = {
      male,
      female,
    };

    await this.updateBoard(boardNo, boardDetail);
    await this.updateBoardMember(boardNo, boardMember);
    await this.updateHostMember(boardNo, hostMembers);
    return `${boardNo}번 게시글이 수정되었습니다.`;
  }

  private async updateBoard(
    boardNo: number,
    boardDetail: BoardDetail,
  ): Promise<void> {
    const updateBoard = await this.boardRepository.updateBoard(
      boardNo,
      boardDetail,
    );

    if (!updateBoard) {
      throw new NotFoundException(
        `${boardNo}번 게시글 수정 에러 updateBoard-service`,
      );
    }
  }

  private async updateBoardMember(
    boardNo: number,
    boardMember: BoardMemberDetail,
  ): Promise<void> {
    const updateBoardMember = await this.boardMemberInfoRepository.updateBoardMember(
      boardNo,
      boardMember,
    );

    if (!updateBoardMember) {
      throw new NotFoundException(
        `${boardNo}번 게시글 수정 에러 updateBoardMember-service`,
      );
    }
  }

  private async updateHostMember(
    boardNo: number,
    hostMembers: [],
  ): Promise<void> {
    for (let member in hostMembers) {
      const userNo: number = await this.testUserRepo.getUserByNickname(
        hostMembers[member],
      );
      const updateHostMember = await this.boardRepository.updateHostMember(
        boardNo,
        userNo,
      );

      if (!updateHostMember) {
        throw new NotFoundException(
          `${boardNo}번 게시글 수정 에러 updateBoardMember-service`,
        );
      }
    }
  }

  //게시글 삭제 관련
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
  private async saveNoticeApplication(boardNo: number): Promise<number> {
    const type = NoticeType.GUEST_APPLICATION;
    const board = await this.getBoardByNo(boardNo)

    const noticeNo = await this.noticeRepository.saveNoticeBoard({
      type,
      targetUserNo: board.hostUserNo,
    });

    if (!noticeNo) {
      throw new InternalServerErrorException('notice-데이터 생성에 실패하였습니다.');
    }

    const result = await this.noticeBoardsRepository.saveNoticeBoard({
      noticeNo,
      boardNo,
    });
    if (!result) {
      throw new InternalServerErrorException('saveNoticeApplication-알람 생성에 실패하였습니다.');
    }

    return result;
  }
}
