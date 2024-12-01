import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid-pro";
import CircularProgress from "@mui/material/CircularProgress";
import { GridApiPro } from "@mui/x-data-grid-pro/models/gridApiPro";
import { MutableRefObject } from "react";

interface ReferralCodeEditCellInputProps {
  params: GridRenderEditCellParams;
  handleOnChangeReferralCode: (e: React.ChangeEvent<HTMLInputElement>, params: GridRenderEditCellParams, apiRef:MutableRefObject<GridApiPro>) => void;
}

const ReferralCodeEditCellInput: React.FC<ReferralCodeEditCellInputProps> = ({ params, handleOnChangeReferralCode }) => {
  const apiRef = useGridApiContext();
  return (
    <>
      {params.row.isLoading ? (
        <CircularProgress size={20} />
      ) : (
        <input
          type="number"
          value={params.value}
          onChange={(e) => handleOnChangeReferralCode(e, params, apiRef)}
          className="w-full disabled:bg-gray-100"
          disabled={params.row.isReferralCodeDisabled}
        />
      )}
    </>
  );
};

export default ReferralCodeEditCellInput;
