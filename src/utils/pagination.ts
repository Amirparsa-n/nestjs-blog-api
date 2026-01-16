import type { PaginationDto } from '@common/dtos/pagination.dto';

export function paginationSolver(paginationDto: PaginationDto) {
  let limit = Number(paginationDto.limit);
  if (Number.isNaN(limit) || limit <= 0) {
    limit = 10;
  }

  let page = Number(paginationDto.page);
  if (Number.isNaN(page) || page <= 0) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  return {
    take: limit,
    skip,
    page: page,
  };
}

export function paginationResponse({
  count,
  page,
  take,
  data,
}: {
  data: unknown;
  count: number;
  page: number;
  take: number;
}) {
  return {
    data,
    pagination: {
      totalCount: count,
      page: +page,
      limit: +take,
      pageCount: Math.ceil(count / take),
    },
  };
}
