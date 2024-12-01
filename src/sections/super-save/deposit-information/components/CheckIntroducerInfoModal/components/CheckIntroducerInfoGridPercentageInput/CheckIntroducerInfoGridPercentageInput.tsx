import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid-pro";

interface PercentageEditCellInputProps {
  params: GridRenderEditCellParams;
}

const PercentageEditCellInput: React.FC<PercentageEditCellInputProps> = ({ params }) => {
  const apiRef = useGridApiContext();
  return (
    <input
      type="number"
      value={params.value}
      onChange={(e) => {
        if (
          Number(e.target.value) > 100 ||
          Number(e.target.value) < 0
        ) {
          return;
        }
        apiRef.current.setEditCellValue({
          id: params.id,
          field: "percentage",
          value: e.target.value,
        });
      }}
      max={100}
      min={0}
    />
  );
};

export default PercentageEditCellInput;
