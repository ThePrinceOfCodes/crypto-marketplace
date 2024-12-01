export type DataFilterType = {
  startDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usdt_status?: any;
  endDate?: string;
  searchKey?: string;
  memberType? : string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  super_trust_status?: any;
  super_save_restriction?: any;
  super_save_community?: string;
  dateTo?:string;
  dateFrom?:string;
  sort_type?: string;
  sort_column_name?: string;
  community?:string;
  credit_sale_permission?:string[];
  isBuy?: string;
  muiFilters?: FilterProps[];
  action_date?: string | string[];
};

interface FilterProps{
  search_by?: string;
  search_value?: string;
  op?: string;
}
export interface DataFilterProps {
  onChange: (props: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusOptions?: { label: string; value: any; className?: string }[];
  statusOptions2?: { label: string; value: any; className?: string }[];
  label?: string;
  label2?: string;
  dateFilterEnabled?: boolean;
  selectStyle?: object;
  flatPickerClass?: string;
  filterStatusId?: string;
  closeDrawerAction? : ()=>void;
}
