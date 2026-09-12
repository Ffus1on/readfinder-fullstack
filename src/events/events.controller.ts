import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Render,
  Redirect,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, requireUserId, viewUser } from '../auth/auth-user';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EVENT_DATE_ERROR } from './event-date.rule';

@ApiExcludeController()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @PublicAccess()
  @Render('events/index')
  async findAll(@Req() req: Request) {
    const events = await this.eventsService.findAll();
    const user = getUser(req);
    return {
      title: 'Мероприятия - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      user: viewUser(user),
      events,
    };
  }

  @Get('add')
  @Render('events/add')
  async addForm(@Req() req: Request) {
    const libraries = await this.eventsService.findLibraries();
    const user = getUser(req);
    return {
      title: 'Создать мероприятие - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      scripts: ['/javascript/event-form-validation.js'],
      user: viewUser(user),
      libraries,
      dateError: EVENT_DATE_ERROR,
    };
  }

  @Get(':id')
  @PublicAccess()
  @Render('events/show')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const event = await this.eventsService.findOne(id);
    const user = getUser(req);
    return {
      title: `${event.title} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/events.css'],
      user: viewUser(user),
      event,
    };
  }

  @Get(':id/edit')
  @Render('events/edit')
  async editForm(@Param('id') id: string, @Req() req: Request) {
    const event = await this.eventsService.findOneForEdit(
      id,
      requireUserId(req),
    );
    const libraries = await this.eventsService.findLibraries();
    const user = getUser(req);
    return {
      title: 'Редактировать мероприятие - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      scripts: ['/javascript/event-form-validation.js'],
      user: viewUser(user),
      event,
      libraries,
      dateError: EVENT_DATE_ERROR,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const event = await this.eventsService.create(dto, requireUserId(req));
    return { url: `/events/${event.id}` };
  }

  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    await this.eventsService.update(id, dto, requireUserId(req));
    return { url: `/events/${id}` };
  }

  @Delete(':id')
  @Roles('admin')
  @Redirect()
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
    return { url: `/events` };
  }
}
