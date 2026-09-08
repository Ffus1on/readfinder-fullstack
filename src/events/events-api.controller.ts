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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
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

@ApiTags('Events')
@Controller('api/events')
@UsePipes(ApiValidationPipe)
export class EventsApiController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
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
  @ApiOperation({ summary: 'Получить мероприятие по id' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать мероприятие' })
  @ApiCreatedResponse({ type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить мероприятие' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить мероприятие' })
  @ApiParam({ name: 'id', example: 'event-id' })
  @ApiNoContentResponse({ description: 'Мероприятие удалено' })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
