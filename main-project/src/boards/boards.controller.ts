import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entity/board.entity';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController');
  constructor(private boardService: BoardsService) {}

  @Post()
  //   @UsePipes(ValidationPipe)
  createBoard(
    @Body()
    createBoarddto: CreateBoardDto,
  ): Promise<Board> {
    // this.logger.debug(`User : ${user.username} creating a new board.`);

    return this.boardService.createBoard(createBoarddto);
  }
}
