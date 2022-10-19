import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardReadResponse } from './interface/boards.interface';

@Controller('boards')
@ApiTags('게시글 API')
export class BoardsController {
  constructor(private boardService: BoardsService) {}
  //Get Methods
  @Get()
  @ApiOperation({
    summary: '게시글 전체 조회 API',
    description: '게시글 전부를 내림차순으로 조회한다.',
  })
  async getAllBoards(): Promise<object> {
    try {
      const boards: object = await this.boardService.getAllBoards();
      const response = {
        success: true,
        boards,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('/:boardNo')
  @ApiOperation({
    summary: '게시글 상세조회 API',
    description: '게시글 번호를 사용해 상세조회한다.',
  })
  async getBoardByNo(@Param('boardNo') boardNo: number): Promise<object> {
    try {
      const board: BoardReadResponse = await this.boardService.getBoardByNo(
        boardNo,
      );
      const response = {
        success: true,
        board,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '게시글 생성 API',
    description: '입력한 정보로 게시글, 멤버 정보을 생성한다.',
  })
  async createBoard(@Body() createBoarddto: CreateBoardDto): Promise<object> {
    try {
      const board: number = await this.boardService.createBoard(createBoarddto);
      const response = { success: true, board };

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Post('/:boardNo/:userNo')
  @ApiOperation({
    summary: '북마크 생성 API',
    description: '게시글 번호를 통해 해당 User의 북마크를 생성한다..',
  })
  async createBookmark(
    @Param() params: { [key: string]: number }, // jwt -> userNo
  ): Promise<object> {
    try {
      const { boardNo, userNo } = params;
      const bookmark: number = await this.boardService.createBookmark(
        boardNo,
        userNo,
      );
      const response = { success: true, bookmark };

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Patch Methods
  @Patch('/:boardNo')
  @ApiOperation({
    summary: '게시글 수정 API',
    description: '입력한 정보로 게시글, 멤버 정보을 수정한다.',
  })
  async updateBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<object> {
    try {
      const board: string = await this.boardService.editBoard(
        boardNo,
        updateBoardDto,
      );

      const response: object = {
        success: true,
        msg: board,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete Methods
  @Delete('/:boardNo')
  @ApiOperation({
    summary: '게시글 삭제 API',
    description: '게시글 번호를 사용해 게시글, 게시글 멤버 정보을 삭제한다.',
  })
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
  ): Promise<string> {
    try {
      const board: string = await this.boardService.deleteBoardByNo(boardNo);

      return board;
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:boardNo/:userNo') // 후에 jwt에서 userNo 빼올 예정
  @ApiOperation({
    summary: '북마크 취소 API',
    description: '게시글 번호를 사용해 해당 User의 북마크를 취소한다.',
  })
  async cancelBookmark(
    @Param() params: { [key: string]: number }, // userNo -> jwt
  ): Promise<string> {
    try {
      const { boardNo, userNo } = params;
      const board = await this.boardService.cancelBookmark(boardNo, userNo);

      return board;
    } catch (error) {
      throw error;
    }
  }
}
