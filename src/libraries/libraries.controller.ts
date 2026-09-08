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
import { LibrariesService } from './libraries.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { authSuffix, isAuthenticated } from '../common/utils';

@ApiExcludeController()
@Controller('libraries')
export class LibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  @Render('libraries/index')
  async findAll(@Query('auth') auth?: string) {
    const libraries = await this.librariesService.findAll();
    return {
      title: 'Адреса библиотек - ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/addresses.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      ],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      libraries,
      scripts: [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        '/javascript/map.js',
      ],
    };
  }

  @Get('add')
  @Render('libraries/add')
  addForm(@Query('auth') auth?: string) {
    return {
      title: 'Добавить библиотеку - ReadFinder',
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
    };
  }

  @Get(':id')
  @Render('libraries/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const library = await this.librariesService.findOne(id);
    return {
      title: `${library.name} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      library,
    };
  }

  @Get(':id/edit')
  @Render('libraries/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const library = await this.librariesService.findOne(id);
    return {
      title: 'Редактировать библиотеку - ReadFinder',
      styles: ['/styles/template.css', '/styles/addresses.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      library,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateLibraryDto, @Query('auth') auth?: string) {
    const library = await this.librariesService.create(dto);
    return { url: `/libraries/${library.id}${authSuffix(auth)}` };
  }

  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLibraryDto,
    @Query('auth') auth?: string,
  ) {
    await this.librariesService.update(id, dto);
    return { url: `/libraries/${id}${authSuffix(auth)}` };
  }

  @Delete(':id')
  @Redirect()
  async remove(@Param('id') id: string, @Query('auth') auth?: string) {
    await this.librariesService.remove(id);
    return { url: `/libraries${authSuffix(auth)}` };
  }
}
