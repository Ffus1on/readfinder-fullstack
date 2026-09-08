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
import { getUser, viewUser } from '../auth/auth-user';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { LibrariesService } from './libraries.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';

@ApiExcludeController()
@Controller('libraries')
export class LibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  @PublicAccess()
  @Render('libraries/index')
  async findAll(@Req() req: Request) {
    const libraries = await this.librariesService.findAll();
    const user = getUser(req);
    return {
      title: 'Адреса библиотек - ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/addresses.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      ],
      user: viewUser(user),
      libraries,
      scripts: [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        '/javascript/map.js',
      ],
    };
  }

  @Get('add')
  @Roles('admin')
  @Render('libraries/add')
  addForm(@Req() req: Request) {
    const user = getUser(req);
    return {
      title: 'Добавить библиотеку - ReadFinder',
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: viewUser(user),
    };
  }

  @Get(':id')
  @PublicAccess()
  @Render('libraries/show')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const library = await this.librariesService.findOne(id);
    const user = getUser(req);
    return {
      title: `${library.name} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: viewUser(user),
      library,
    };
  }

  @Get(':id/edit')
  @Roles('admin')
  @Render('libraries/edit')
  async editForm(@Param('id') id: string, @Req() req: Request) {
    const library = await this.librariesService.findOne(id);
    const user = getUser(req);
    return {
      title: 'Редактировать библиотеку - ReadFinder',
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: viewUser(user),
      library,
    };
  }

  @Post()
  @Roles('admin')
  @Redirect()
  async create(@Body() dto: CreateLibraryDto) {
    const library = await this.librariesService.create(dto);
    return { url: `/libraries/${library.id}` };
  }

  @Patch(':id')
  @Roles('admin')
  @Redirect()
  async update(@Param('id') id: string, @Body() dto: UpdateLibraryDto) {
    await this.librariesService.update(id, dto);
    return { url: `/libraries/${id}` };
  }

  @Delete(':id')
  @Roles('admin')
  @Redirect()
  async remove(@Param('id') id: string) {
    await this.librariesService.remove(id);
    return { url: `/libraries` };
  }
}
