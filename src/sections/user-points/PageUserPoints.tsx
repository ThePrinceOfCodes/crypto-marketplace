import { DataGridPro, GridColDef, useGridApiRef } from "@mui/x-data-grid-pro";
import { useEffect, useState } from "react";
import Link from "next/link";
import { INPUT_CLASS } from "@common/constants/classes";
import { useGetCardPoints } from "api/hooks";
import { getLocalStorageState, showSortingPageNotification } from "@common/utils/helpers";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const columns: GridColDef[] = [
  {
    ...sharedColDef,
    field: "id",
    headerName: "User ID",
    width: 100,
    sortable: true,
    renderCell: ({ row }) => <span className="pl-5">#{row.id}</span>,
  },
  {
    ...sharedColDef,
    field: "email",
    headerName: "Email",
    flex: 1,
    minWidth: 200,
  },
  { ...sharedColDef, field: "point", headerName: "Point", flex: 1, width: 100 },
  { ...sharedColDef, field: "type", headerName: "Type", flex: 1, width: 100 },
  {
    ...sharedColDef,
    field: "action",
    headerName: "",
    width: 100,
    align: "right",
    renderCell: ({ row }) => (
      <div className="w-full flex">
        <Link href={`/user-points/detail?userId=${row.id}`}>
          <button className="text-blue-600 font-medium">View</button>
        </Link>
      </div>
    ),
  },
];

function PageUserPoints() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  // const [searchText, setSearchText] = useState("");

  const { data, isLoading } = useGetCardPoints({ page, pageSize });

  // const onChangeSearch = useCallback((text: string) => {
  //   setSearchText(text);
  // }, []);

  // const searchFunc = (_debounce(onChangeSearch, 500), []);

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
  } = useGridColumnChange("userPointsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div className="flex h-full flex-col px-5 py-10">
      <h1 className="text-4xl mb-20 font-semibold">Card Points</h1>

      <div className="flex justify-between mb-5">
        <div className="flex">
          <input
            placeholder="Search..."
            className={INPUT_CLASS}
          // onChange={(e) => searchFunc(e.target.value)}
          />
          {(Object.keys(columnCurrentState).length > 0) &&
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          }
        </div>
        <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
      </div>
      <div className="w-full h-full bg-white">
        <DataGridPro
          rows={data?.data || []}
          rowCount={data?.total || 0}
          columns={columns}
          loading={isLoading}
          rowsPerPageOptions={[10, 20, 50]}
          page={page}
          paginationMode="server"
          onPageChange={(e) => setPage(e)}
          pageSize={pageSize}
          onPageSizeChange={(e) => setPageSize(e)}
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
export default PageUserPoints;
