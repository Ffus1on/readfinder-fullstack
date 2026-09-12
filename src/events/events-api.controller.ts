import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { PaginatedEventsDto } from './dto/paginated-events.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { requireUserId } from '../auth/auth-user';

@ApiTags('Events')
@Controller('api/events')
@UsePipes(ApiValidationPipe)
export class EventsApiController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @PublicAccess()
  @ApiOperation({ summary: 'Получить список мероприятий с пагинацией' })
  @ApiOkResponse({ type: PaginatedEventsDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.eventsService.findAllPaginated(query);
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      '/api/events',
      query,
      data,
      total,
    );
  }

  @Get(':id')
  @PublicAccess()
  @ApiOperation({ summary: 'Получить мероприятие по id' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Создать мероприятие' })
  @ApiCreatedResponse({ type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  create(@Body() dto: CreateEventDto, @Req() req: Request) {
    return this.eventsService.create(dto, requireUserId(req));
  }

  @Patch(':id')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Обновить мероприятие' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения чужого мероприятия',
  })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    return this.eventsService.update(id, dto, requireUserId(req));
  }

  @Delete(':id')
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить мероприятие' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiNoContentResponse({ description: 'Мероприятие удалено' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Доступно только администратору' })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
