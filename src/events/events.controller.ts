import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Render,
  Redirect,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { authSuffix, isAuthenticated } from '../common/utils';

@ApiExcludeController()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Render('events/index')
  async findAll(@Query('auth') auth?: string) {
    const events = await this.eventsService.findAll();
    return {
      title: 'Мероприятия - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      events,
    };
  }

  @Get('add')
  @Render('events/add')
  async addForm(@Query('auth') auth?: string) {
    const libraries = await this.eventsService.findLibraries();
    return {
      title: 'Создать мероприятие - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      libraries,
    };
  }

  @Get(':id')
  @Render('events/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const event = await this.eventsService.findOne(id);
    return {
      title: `${event.title} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/events.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      event,
    };
  }

  @Get(':id/edit')
  @Render('events/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const event = await this.eventsService.findOne(id);
    const libraries = await this.eventsService.findLibraries();
    return {
      title: 'Редактировать мероприятие - ReadFinder',
      styles: ['/styles/template.css', '/styles/events.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      event,
      libraries,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateEventDto, @Query('auth') auth?: string) {
    const event = await this.eventsService.create(dto);
    return { url: `/events/${event.id}${authSuffix(auth)}` };
  }

  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Query('auth') auth?: string,
  ) {
    await this.eventsService.update(id, dto);
    return { url: `/events/${id}${authSuffix(auth)}` };
  }

  @Delete(':id')
  @Redirect()
  async remove(@Param('id') id: string, @Query('auth') auth?: string) {
    await this.eventsService.remove(id);
    return { url: `/events${authSuffix(auth)}` };
  }
}
