export const STUDENTS_PAGE_SIZE = 20;
export const QUIZZES_PAGE_SIZE = 20;
export const SESSIONS_PAGE_SIZE = 10;
export const QUESTIONS_PAGE_SIZE = 10;
export const SESSION_RESULTS_PAGE_SIZE = 10;

export function getPageCount(totalItems: number, pageSize: number) {
  if (totalItems === 0) {
    return 1;
  }

  return Math.ceil(totalItems / pageSize);
}

export function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), pageCount);
}

export function paginateSlice<T>(items: T[], page: number, pageSize: number) {
  const pageCount = getPageCount(items.length, pageSize);
  const safePage = clampPage(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
  };
}
