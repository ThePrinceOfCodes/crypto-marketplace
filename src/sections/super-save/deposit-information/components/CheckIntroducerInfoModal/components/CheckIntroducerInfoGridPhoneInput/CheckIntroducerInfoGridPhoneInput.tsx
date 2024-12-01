import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid-pro';
import { GridApiRefType } from './types';


interface PhoneNumberEditCellInputProps {
  params: GridRenderEditCellParams;
  handleOnChangePhoneNumber: (e: React.ChangeEvent<HTMLInputElement>, params: GridRenderEditCellParams, api: GridApiRefType) => void;
}

const PhoneNumberEditCellInput: React.FC<PhoneNumberEditCellInputProps> = ({ params, handleOnChangePhoneNumber}) => {
  const apiRef = useGridApiContext();
  return (
    <input
      type="text"
      value={params.value}
      onChange={(e) => handleOnChangePhoneNumber(e, params, apiRef)}
      disabled={params.row.isPhoneDisabled}
      className="w-full disabled:bg-gray-100"
    />
  );
};

export default PhoneNumberEditCellInput;
