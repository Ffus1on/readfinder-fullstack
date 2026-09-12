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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventResponseDto } from './dto/event-response.dto';
import { PaginatedEventsDto } from './dto/paginated-events.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { requireUserId } from '../auth/auth-user';

@ApiTags('Events')
@Controller('api/users/:userId/events')
@UsePipes(ApiValidationPipe)
export class EventsUserApiController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить мероприятия, созданные пользователем' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiOkResponse({ type: PaginatedEventsDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для просмотра' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findAll(
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.eventsService.findEventsByUserPaginated(
      userId,
      query,
      requireUserId(req),
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/users/${userId}/events`,
      query,
      data,
      total,
    );
  }

  @Get(':eventId')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить конкретное мероприятие пользователя' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiParam({ name: 'eventId', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для просмотра' })
  @ApiNotFoundResponse({
    description: 'Пользователь или мероприятие не найдены',
  })
  async findOne(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Req() req: Request,
  ) {
    return this.eventsService.findEventRelationForUser(
      userId,
      eventId,
      requireUserId(req),
    );
  }
}
