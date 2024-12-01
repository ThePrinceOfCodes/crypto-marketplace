import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useEffect, useState } from "react";
import { useGetCardPoints } from "api/hooks";
import { INPUT_CLASS } from "@common/constants/classes";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1
};

const columns: GridColDef[] = [
  {
    ...sharedColDef,
    field: "id",
    headerName: "ID",
    sortable: true,
    renderCell: ({ row }) => <span className="pl-5">#{row.id}</span>,
  },
  { ...sharedColDef, field: "name", headerName: "Name" },
  { ...sharedColDef, field: "code", headerName: "Code" },
];

function PageAffiliateCards() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  // const [searchText, setSearchText] = useState("");

  const getListQuery = useGetCardPoints({ page, pageSize });
  const { data, isLoading } = getListQuery;

  // const onChangeSearch = (text: string) => {
  //   setSearchText(text);
  // };

  // const searchFunc = useCallback(_debounce(onChangeSearch, 500), []);

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
  } = useGridColumnChange("affiliateCardsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div className="flex h-full flex-col px-5 py-10">
      <h1 className="text-4xl mb-20 font-semibold">Affiliate Cards</h1>
      <div className="flex justify-between">
        <div className="self-end mb-5">
          <input
            placeholder="Search..."
            className={INPUT_CLASS}
          // onChange={(e) => searchFunc(e.target.value)}
          />
        </div>
        <div className="flex items-baseline">
          {(Object.keys(columnCurrentState).length > 0) &&
            <div className="self-start mr-2">
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          }
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
        </div>
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
export default PageAffiliateCards;
