export interface PaginatedResponse<TItem, TSummary = undefined> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: TSummary;
}

export interface BasePaginationQuery {
  page: number;
  pageSize: number;
  search?: string;
}
