import { PageArgs } from './page.args';
import { PageMeta } from './page-meta.object';
import { clampPage, resolvePagination } from '../../common/pagination';

export function buildPageMeta(args: PageArgs, total: number): PageMeta {
  const { page, pageSize } = resolvePagination(args);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page: clampPage(page, total, pageSize),
    pageSize,
    total,
    totalPages,
  };
}
