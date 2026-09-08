import { PageArgs } from './page.args';
import { PageMeta } from './page-meta.object';
import { resolvePagination } from '../../common/pagination';

export function buildPageMeta(args: PageArgs, total: number): PageMeta {
  const { page, pageSize } = resolvePagination(args);
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
