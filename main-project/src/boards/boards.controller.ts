import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardService: BoardsService) {}
  //Get Methods
  @Get()
  async getAllBoards(): Promise<object> {
    const boards: object = await this.boardService.getAllBoards();
    const response = {
      success: true,
      boards,
    };

    return response;
  }

  @Get('/:boardNo')
  async getBoardByNo(@Param('boardNo') boardNo: number): Promise<object> {
    const board: object = await this.boardService.getBoardByNo(boardNo);
    const response = {
      success: true,
      board,
    };

    return response;
  }

  // Post Methods
  @Post()
  async createBoard(@Body() createBoarddto: CreateBoardDto): Promise<object> {
    const board: number = await this.boardService.createBoard(createBoarddto);
    const response = { success: true, board };

    return response;
  }

  @Post('/:boardNo')
  async createBookmark(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ): Promise<object> {
    const bookmark: number = await this.boardService.createBookmark(
      boardNo,
      createBookmarkDto,
    );
    const response = { success: true, bookmark };

    return response;
  }

  // Patch Methods
  @Patch('/:boardNo')
  async updateBoardStatus(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    const board: object = await this.boardService.updateBoard(
      boardNo,
      updateBoardDto,
    );
    const response = { success: true, board };

    return response;
  }

  // Delete Methods
  @Delete('/:boardNo')
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
  ): Promise<object> {
    await this.boardService.deleteBoardByNo(boardNo);

    return { success: true };
  }
}
