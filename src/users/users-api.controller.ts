import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from '../generated/prisma-class/user';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@Controller('api/users')
@UsePipes(ApiValidationPipe)
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить список пользователей с пагинацией' })
  @ApiOkResponse({ type: PaginatedUsersDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.usersService.findAllPaginated(query);
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      '/api/users',
      query,
      data,
      total,
    );
  }

  @Get(':userId')
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }
}
