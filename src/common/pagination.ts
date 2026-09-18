import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Request, Response } from 'express';

export class PaginationDto {
  @ApiProperty({ required: false, example: 1, description: 'Номер страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Размер страницы (1–50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export interface PaginationView {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPages: boolean;
  prevPage: number;
  nextPage: number;
  searchQuery: string;
}

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 10;

function normalizeInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = value === undefined ? NaN : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export function buildPaginationView(
  query: PaginationDto,
  total: number,
  search?: string,
): PaginationView {
  const { page, pageSize, totalPages } = buildPageMetaBase(query, total);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPages: totalPages > 1,
    prevPage: page > 1 ? page - 1 : 0,
    nextPage: page < totalPages ? page + 1 : 0,
    searchQuery: search ? encodeURIComponent(search) : '',
  };
}

export function resolvePagination(query: PaginationDto): {
  page: number;
  pageSize: number;
} {
  return {
    page: normalizeInt(query.page, 1, 1, Number.MAX_SAFE_INTEGER),
    pageSize: normalizeInt(query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
  };
}

export interface PageMetaCore {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function buildPageMetaBase(
  query: PaginationDto,
  total: number,
): PageMetaCore {
  const { page, pageSize } = resolvePagination(query);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { page: Math.min(page, totalPages), pageSize, total, totalPages };
}

export function clampPage(
  page: number,
  total: number,
  pageSize: number,
): number {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, totalPages);
}

export async function paginate<T>(
  query: PaginationDto,
  count: () => Promise<number>,
  fetch: (skip: number, take: number) => Promise<T[]>,
): Promise<{ data: T[]; total: number }> {
  const { page, pageSize } = resolvePagination(query);
  const total = await count();
  const current = clampPage(page, total, pageSize);
  const data = await fetch((current - 1) * pageSize, pageSize);
  return { data, total };
}

export function buildOrigin(req: Request): string {
  const proto = req.get('x-forwarded-proto') ?? req.protocol;
  return `${proto}://${req.get('host')}`;
}

export function buildLinkHeader(
  origin: string,
  basePath: string,
  page: number,
  pageSize: number,
  totalPages: number,
): string {
  const links: string[] = [];
  const urlFor = (p: number) =>
    `${origin}${basePath}?page=${p}&pageSize=${pageSize}`;

  if (page > 1 && page <= totalPages) {
    links.push(`<${urlFor(page - 1)}>; rel="prev"`);
  }
  if (page < totalPages) {
    links.push(`<${urlFor(page + 1)}>; rel="next"`);
  }
  links.push(`<${urlFor(totalPages)}>; rel="last"`);
  links.push(`<${urlFor(1)}>; rel="first"`);
  return links.join(', ');
}

export function buildPaginatedResponse<T>(
  res: Response,
  origin: string,
  basePath: string,
  query: PaginationDto,
  data: T[],
  total: number,
): PaginatedResponse<T> {
  const { page, pageSize, totalPages } = buildPageMetaBase(query, total);
  res.setHeader(
    'Link',
    buildLinkHeader(origin, basePath, page, pageSize, totalPages),
  );
  return { data, meta: { page, pageSize, total, totalPages } };
}
