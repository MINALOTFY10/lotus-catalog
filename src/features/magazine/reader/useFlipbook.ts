export function calculateRtlPageIndex(pageIndex: number, totalPages: number): number {
  if (pageIndex < 1) return 1;
  if (pageIndex > totalPages) return totalPages;
  return pageIndex;
}

export function resolveCurrentPage(pageParam?: string | string[] | null, totalPages: number = 65): number {
  if (!pageParam) return 1;
  const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  if (parsed > totalPages) return totalPages;
  return parsed;
}
