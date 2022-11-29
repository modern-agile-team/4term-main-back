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
import { UsersRepository } from 'src/users/repository/users.repository';
import { BoardDto } from './dto/board.dto';
import {
  BoardMemberDetail,
  CreateResponse,
  BoardReadResponse,
  BoardDetail,
  BoardAndUserNumber,
  GuestApplication,
  HostMembers,
  UserNo,
} from './interface/boards.interface';
import { BoardRepository, TestUserRepo } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @InjectRepository(NoticesRepository)
    private readonly noticeRepository: NoticesRepository,
    @InjectRepository(NoticeBoardsRepository)
    private readonly noticeBoardsRepository: NoticeBoardsRepository,
    // test repo 삭제 예정
    @InjectRepository(TestUserRepo)
    private readonly testUserRepo: TestUserRepo,
  ) { }

  // 게시글 생성 관련
  private async setBoard(boardInfo: BoardDetail, userNo: number): Promise<number> {
    const board: BoardDetail = { ...boardInfo, userNo }
    const { affectedRows, insertId }: CreateResponse =
      await this.boardRepository.createBoard(board);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`board 생성 오류입니다.`);
    }

    return insertId;
  }

  private async setHostMembers(
    { boardNo, userNo, hostMembers }: HostMembers
  ): Promise<void> {
    for (let el in hostMembers) {

      const user = await this.testUserRepo.getUserByNickname(
        hostMembers[el],
      );

      // 수정 예정
      if (!user) {
        throw new NotFoundException(`해당 유저가 없습니다.`);
      }
      const hostMember: BoardAndUserNumber = { boardNo, userNo: user.no };

      const { affectedRows, insertId }: CreateResponse =
        await this.boardRepository.createHostMember(hostMember);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`host-member 생성 오류입니다.`);
      }

      if (Number(el) === hostMembers.length - 1) {
        const hostMember: BoardAndUserNumber = { boardNo, userNo };

        const { affectedRows, insertId }: CreateResponse =
          await this.boardRepository.createHostMember(hostMember);

        if (!(affectedRows && insertId)) {
          throw new InternalServerErrorException(`host 생성 오류입니다.`);
        }
      }
    }
  }

  private async setBoardMember(
    boardMemberDetail: BoardMemberDetail,
  ): Promise<void> {
    const { affectedRows, insertId }: CreateResponse =
      await this.boardRepository.createBoardMember(boardMemberDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`board-member 생성 오류입니다.`);
    }
  }

  async createBoard({ hostMembers, userNo, ...boardInfo }: BoardDto): Promise<number> {
    const boardNo: number = await this.setBoard(boardInfo, userNo);
    const memberInfo: HostMembers = { boardNo, userNo, hostMembers }

    await this.setHostMembers(memberInfo); // transaction

    const boardMemberDetail: BoardMemberDetail = {
      ...boardInfo,
      boardNo,
    };

    await this.setBoardMember(boardMemberDetail);

    return boardNo;
  }

  async createBookmark(bookmarkDetail: BoardAndUserNumber): Promise<number> {
    const { affectedRows, insertId }: CreateResponse =
      await this.boardRepository.createBookmark(bookmarkDetail);

    if (!(affectedRows && insertId)) {
      throw new InternalServerErrorException(`bookmark 생성 오류입니다.`);
    }

    return insertId;
  }

  async createAplication({ boardNo, guests }: GuestApplication): Promise<number> {
    const guestNums: number[] = await this.validateGuests(boardNo, guests)

    const guestMembers: void = await this.createGuestMembers(boardNo, guestNums);
    const notice = await this.saveNoticeApplication(boardNo);

    return notice;
  }

  private async validateGuests(boardNo: number, guests: []): Promise<number[]> {
    const board = await this.boardRepository.getAllGuestByBoardNo(boardNo);
    const guestNums: number[] = [];

    for (let index in guests) {
      const user: UserNo = await this.testUserRepo.getUserByNickname(guests[index])
      if (!user) {
        throw new NotFoundException(`${guests[index]} 사용자가 없습니다.`)
      }

      for (let idx in board) {
        if (board[idx].userNo === user.no) {
          throw new BadRequestException(`${guests[index]} 사용자가 이미 신청 목록에 있습니다.`)
        }
      }
      guestNums.push(user.no)
    }

    return guestNums;
  }

  private async createGuestMembers(boardNo: number, guestNums: number[]): Promise<void> {
    for (let index in guestNums) {
      const { affectedRows, insertId }: CreateResponse =
        await this.boardRepository.createGuestMembers(boardNo, guestNums[index]);
      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`guest-application 생성 오류입니다.`);
      }
    }
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
    const updateBoardMember = await this.boardRepository.updateBoardMember(
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
    await this.boardRepository.cancelBookmark(boardNo, userNo);

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
