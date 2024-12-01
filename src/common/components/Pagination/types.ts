export type PaginationProps = {
  totalPages?: number;
  page?: number;
  initialPage?: number;
  onChangePage?: (page: number) => void;
  limits?: number[];
  limit?: number;
  defaultLimit?: number;
  onChangeLimit?: (limit: number) => void;
  isFetching: boolean;
  id?: string;
  viewSort?: string;
  setViewSort?: (viewSort: string) => void;
  serverSideSorting?: boolean;
};
