import type { Request } from 'express';

export function parsePagination(params: Request['query']): [number, number] {
  return [
    Math.max(parseInt(typeof params.page === 'string' ? params.page : '', 10) || 1, 1),
    Math.max(parseInt(typeof params.pageSize === 'string' ? params.pageSize : '', 10) || 100, 100)
  ];
}
