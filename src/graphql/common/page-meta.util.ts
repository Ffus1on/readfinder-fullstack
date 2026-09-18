import { PageArgs } from './page.args';
import { PageMeta } from './page-meta.object';
import { buildPageMetaBase } from '../../common/pagination';

export function buildPageMeta(args: PageArgs, total: number): PageMeta {
  const { page, pageSize, totalPages } = buildPageMetaBase(args, total);
  return { page, pageSize, total, totalPages };
}
