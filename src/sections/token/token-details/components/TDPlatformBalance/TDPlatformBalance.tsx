// import { htmlIds } from "@cypress/utils/ids";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/router";
import _debounce from "lodash/debounce";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import {
  useGetPlatformBalance,
} from "api/hooks";
import { inViewport, resetMUIToolbarFilter } from "@common/utils/helpers";
import { Box, IconButton } from "@mui/material";
import { formatNumberWithCommas } from "@common/utils/formatters";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { SearchBox } from "@common/components/SearchBox";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function TDPlatformBalance() {
  const { text } = useLocale();
  const router = useRouter();
  const prevScrollTopRef = useRef(0);
  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState<string>("");
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data, isLoading, isFetching, fetchNextPage } =
  useGetPlatformBalance({
    tokenName: router.query.tokenName as string,
    limit: 25,
    searchKey,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;
    // check if user scrolls down
    if (currentScrollTop > prevScrollTopRef.current) {
      if (data && data.hasNext) {
        const el = document.querySelector(`div[data-id="${data.lastId}"]`);
        // if last element is in viewport, fetch more data
        if (el && inViewport(el)) {
          fetchNextPage({
            pageParam: {
              lastId: data?.lastId,
              lastBalance: data?.lastBalance,
            },
          });
        }
      }
    }
    prevScrollTopRef.current = currentScrollTop;
  }, 500);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeSearch = useCallback(
    _debounce((text: string) => {
      if (text.trim().length >= 3 || text.trim().length === 0) {
        setSearchKey(text.trim());
        setPage(1);

      }
    }, 500),
    [],
  );

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const columns = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "platform_name",
        headerName: `${text("token_details_platform_name")}`,
        minWidth: 100,
        flex: 1,
        width: 100,
        renderCell: ({ value }: any) =>
          value ? (
            <div className="flex items-center w-full">
              <span className="w-[200px] truncate text-ellipsis">{value}</span>
              <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
                <Box display="flex" alignItems="center">
                  <Image
                    className="cursor-pointer"
                    alt=""
                    width={17}
                    height={17}
                    src="/images/copy-icon.svg"
                  />
                </Box>
              </IconButton>
            </div>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "balance",
        headerName: `${text("token_details_user_balance")}`,
        minWidth: 100,
        flex: 1,
        width: 100,
        renderCell: ({ row }) => (
          <div className="flex gap-1">
            <span>{formatNumberWithCommas(row?.balance?.toFixed(2))}</span>
            <span>{row?.tokenName}</span>
          </div>
        ),
      },
    ],
    [] // Dependencies array; add dependencies if needed
  );

  const platformBalanceIndex =
    data?.finalResponse?.map((item) => ({ ...item })) || [];

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
  } = useGridColumnChange("tdPlatformBalanceColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, searchKey]);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full">
        <div>
          <SearchBox onChangeFunc={onChangeSearch} />
        </div>
        <div className="flex justify-end">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
        </div>
      </div>
      <div className="flex justify-end">
        {Object.keys(columnCurrentState).length > 0 && (
          <SaveNResetButtons
            saveHandler={() => setOpenConfirmDialog(true)}
            resetHandler={handleResetDefault}
          />
        )}
      </div>
      <div
        className="w-full h-full bg-white transactions-history-container"
        onScrollCapture={debouncedOnScroll}
      >
        <DataGridPro
          rows={platformBalanceIndex || []}
          rowCount={platformBalanceIndex?.length || 0}
          getRowId={(row) => row.uuid}
          columns={columns}
          loading={isFetching || isLoading}
          disableSelectionOnClick
          paginationMode="server"
          sx={customisedTableClasses}
          hideFooter
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

export default TDPlatformBalance;
