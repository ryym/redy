export type Pagination<ID> = {
  isFetching: boolean;
  nextPageUrl: string | null;
  pageCount: number;
  ids: ID[];
};

export const newPagination = <ID>(): Pagination<ID> => ({
  isFetching: false,
  nextPageUrl: null,
  pageCount: 0,
  ids: [],
});

export const startFetch = <ID>(pg: Pagination<ID> | null): Pagination<ID> => ({
  ...(pg || newPagination()),
  isFetching: true,
});

export const finishFetch = <ID>(
  pg: Pagination<ID>,
  ids: ID[],
  nextPageUrl: string | null,
): Pagination<ID> => ({
  ...pg,
  isFetching: false,
  nextPageUrl,
  pageCount: pg.pageCount + 1,
  ids: [...new Set([...pg.ids, ...ids])],
});
