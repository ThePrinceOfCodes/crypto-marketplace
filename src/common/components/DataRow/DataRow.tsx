import { ReactNode } from "react";

const DataRow = ({
  label,
  value,
  labelConClassName,
  valueConClassName,
  containerConClassName,
}: {
  label: string;
  value: ReactNode;
  labelConClassName?: string;
  valueConClassName?: string;
  containerConClassName?: string;
}) => {
  return (
    <div className={`flex ${containerConClassName}`}>
      <div
        className={`h-[50px] px-[16px] flex items-center w-[240px] min-w-[240px] border-b-[1px] border-white bg-[#EEF0F4] ${labelConClassName}`}
      >
        <p>{label}</p>
      </div>
      <div
        className={`flex-1 flex items-center gap-[12px] px-[20px] border-b-[1px] border-[#EEF0F4] min-w-[240px] break-all ${valueConClassName}`}
      >
        {value}
      </div>
    </div>
  );
};

export default DataRow;
