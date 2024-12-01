export interface ICustomCellWithExpandableProps {
  text?: string;
  textLimit?: number;
  onChangeExpendable?: (isExpanded: boolean) => void;
}
