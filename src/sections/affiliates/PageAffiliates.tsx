import { useLocale } from "locale";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useEffect, useMemo, useState } from "react";
import { ButtonAddAffiliate, ButtonEnableAffiliate } from "./components";
import { INPUT_CLASS } from "@common/constants/classes";
import { useGetAffiliates } from "api/hooks";
import { DateFormatter } from "@common/components";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1
};

function PageAffiliates() {
  const [pageSize, setPageSize] = useState(10);
  const { text } = useLocale();
  const [page, setPage] = useState(0);
  // const [, setSearchText] = useState("");
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const getListQuery = useGetAffiliates({ page, pageSize });
  const { data, isLoading, refetch } = getListQuery;

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "code",
        headerName: "Code",
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: "Name",
        minWidth: 300,
      },
      {
        ...sharedColDef,
        field: "rate",
        headerName: "Rate",
        flex: 0,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "created_at",
        headerName: "Created At",
        renderCell: ({ row }) => <DateFormatter value={row.created_at} breakLine />,
      },
      {
        ...sharedColDef,
        field: "updated_at",
        headerName: "Updated At",
        renderCell: ({ row }) => <DateFormatter value={row.updated_at} breakLine />,
      },
      {
        ...sharedColDef,
        field: "action",
        renderCell: ({ row }) => (
          <div className="flex">
            <ButtonEnableAffiliate data={row} onUpdated={refetch} />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  // const onChangeSearch = (text: string) => {
  //   setSearchText(text);
  // };

  // const searchFunc = useCallback(_debounce(onChangeSearch, 500), []);

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("affiliatesColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div className="flex h-full flex-col px-5 py-10">
      <h1 className="text-4xl mb-20 font-semibold">Affiliate</h1>
      <div className="flex justify-between mb-5">
        <div className="self-end">
          <input
            placeholder="Search..."
            className={`${INPUT_CLASS}`}
          // onChange={(e) => searchFunc(e.target.value)}
          />
        </div>
        <div className="flex">
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
          <ButtonAddAffiliate onAdded={refetch} />
          {(Object.keys(columnCurrentState).length > 0) &&
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          }
        </div>
      </div>
      <div className="flex items-center justify-start pb-3">

      </div>
      <div className="w-full h-full bg-white">
        <DataGridPro
          getRowId={(row) => row.code}
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
export default PageAffiliates;
