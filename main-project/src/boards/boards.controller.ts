import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';
import { create } from 'domain';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController');
  // logger는 middle ware로 분리 필요

  constructor(private boardService: BoardsService) {}

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

  @Post()
  async createBoard(
    @Body()
    createBoarddto: CreateBoardDto,
  ): Promise<object> {
    const board: number = await this.boardService.createBoard(createBoarddto);
    const response = { success: true, board };

    return response;
  }

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

  @Delete('/:boardNo')
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
  ): Promise<object> {
    await this.boardService.deleteBoardByNo(boardNo);

    return { success: true };
  }
}
