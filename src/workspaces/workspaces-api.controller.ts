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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { PaginatedWorkspacesDto } from './dto/paginated-workspaces.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Workspaces')
@Controller('api/workspaces')
@UsePipes(ApiValidationPipe)
export class WorkspacesApiController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @PublicAccess()
  @ApiOperation({ summary: 'Получить список рабочих мест с пагинацией' })
  @ApiOkResponse({ type: PaginatedWorkspacesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } =
      await this.workspacesService.findAllPaginated(query);
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      '/api/workspaces',
      query,
      data,
      total,
    );
  }

  @Get(':id')
  @PublicAccess()
  @ApiOperation({ summary: 'Получить рабочее место по id' })
  @ApiParam({ name: 'id', example: 'workspace-id' })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  @ApiNotFoundResponse({ description: 'Рабочее место не найдено' })
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Post()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Создать рабочее место' })
  @ApiCreatedResponse({ type: WorkspaceResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  create(@Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(dto);
  }

  @Patch(':id')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Обновить рабочее место' })
  @ApiParam({ name: 'id', example: 'workspace-id' })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Рабочее место не найдено' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить рабочее место' })
  @ApiParam({ name: 'id', example: 'workspace-id' })
  @ApiNoContentResponse({ description: 'Рабочее место удалено' })
  @ApiNotFoundResponse({ description: 'Рабочее место не найдено' })
  async remove(@Param('id') id: string) {
    await this.workspacesService.remove(id);
  }
}
