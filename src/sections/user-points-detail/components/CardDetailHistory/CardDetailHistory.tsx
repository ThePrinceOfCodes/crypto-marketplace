import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { getLocalStorageState, showSortingPageNotification } from "@common/utils/helpers";
import { DataGridPro, GridColDef, useGridApiRef } from "@mui/x-data-grid-pro";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { useEffect, useState } from "react";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};

const columns: GridColDef[] = [
  {
    ...sharedColDef,
    field: "id",
    headerName: "ID",
    width: 50,
  },
  {
    ...sharedColDef,
    field: "date",
    headerName: "Approval At",
    flex: 1,
    renderCell: ({ row }) => {
      const date = `${row.approval_date.slice(0, 4)}-${row.approval_date.slice(
        4,
        6,
      )}-${row.approval_date.slice(6)}`;
      const time = `${row.approval_date.slice(0, 2)}:${row.approval_date.slice(
        2,
        4,
      )}:${row.approval_date.slice(4)}`;
      return `${date} ${time}`;
    },
  },
  {
    ...sharedColDef,
    field: "approval_amount",
    headerName: "Amount",
    align: "right",
    width: 100,
  },
  {
    ...sharedColDef,
    field: "is_canceled",
    headerName: "Is Canceled",
    renderCell: ({ row }) => (row.isCanceled ? "Yes" : "No"),
  },
  { ...sharedColDef, field: "card_number", headerName: "Card Number", flex: 1 },
  {
    ...sharedColDef,
    field: "merchant_name",
    headerName: "Merchant Name",
    flex: 1,
  },
  {
    ...sharedColDef,
    field: "point",
    headerName: "Point",
    align: "right",
    width: 100,
  },
];

interface CardHistoryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: [any];
  loading: boolean;
}

function CardDetailHistory(props: CardHistoryProps) {
  const { data, loading } = props;

  /* DataGrid Columns Reorder & Sort Handling Start */
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("cardDetailHistoryColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div>
      <div className="flex justify-between">
        <div>
          {(Object.keys(columnCurrentState).length > 0) &&
            <div className="flex">
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          }
        </div>
        <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
      </div>
      <div className="w-full h-80 bg-white">
        <DataGridPro
          rows={data || []}
          columns={columns}
          rowCount={data?.length || 0}
          paginationMode="server"
          loading={loading}
          rowsPerPageOptions={[10, 20, 50]}
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}
export default CardDetailHistory;
