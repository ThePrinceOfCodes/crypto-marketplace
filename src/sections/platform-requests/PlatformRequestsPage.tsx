import { htmlIds } from "@cypress/utils/ids";
import { useEffect, useMemo, useRef, useState } from "react";
import _debounce from "lodash/debounce";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ButtonApprovePlatform, ButtonDeclinePlatform } from "./components";
import { customisedTableClasses } from "@common/constants/classes";
import { iGetPlatformsRequestsResp, useGetPlatformsRequests } from "api/hooks";
import { useLocale } from "locale";
import { IconButton, Box } from "@mui/material";
import { inViewport, resetMUIToolbarFilter, useCopyToClipboard, } from "@common/utils/helpers";
import Image from "next/image";
import { DateFormatter, ShowEmail } from "@common/components";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { SearchBox } from "@common/components/SearchBox";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function PlatformRequestsPage() {
  const { text } = useLocale();
  const copyToClipboard = useCopyToClipboard();

  const prevScrollTopRef = useRef(0);
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [platforms, setPlatforms] = useState<
    iGetPlatformsRequestsResp["platforms"]
  >([]);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  const { data, isFetching, refetch } = useGetPlatformsRequests(
    {
      limit: 25 * page,
      searchKey,
    },
    {
      onSuccess: (resp) => {
        setPlatforms(resp.platforms);
      },
    },
  );

  const onUpdated = () => {
    refetch();
    document
      ?.querySelector?.(".MuiDataGrid-virtualScroller")
      ?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const columns: GridColDef[] = useMemo(
    () => [
        {
          ...sharedColDef,
          field: "uuid",
          minWidth: 150,
          headerName: `${text("platform_requests_column_header_id")}`,
          renderCell: ({ row }) => {
            return (
              <div className="w-full flex justify-between">
                <span className="w-fit flex-grow truncate">{row.uuid}</span>
                <Image
                  className="ml-5 cursor-pointer"
                  width={19}
                  height={19}
                  src="/images/copy-icon.svg"
                  alt="Copy Icon"
                  onClick={() => copyToClipboard(row.uuid)}
                  aria-label="copy icon"
                />
              </div>
            );
          },
        },
        {
          ...sharedColDef,
          field: "name",
          headerName: `${text("platform_requests_column_header_name")}`,
          minWidth: 100,
        },
        {
          ...sharedColDef,
          field: "platform_user",
          headerName: `${text("add_platform_header_platform_user")}`,
          minWidth: 160,
          renderCell: ({ value }) => (
            <div className="flex w-full justify-start items-center">
              <span className="w-fit truncate text-ellipsis">
                {!showEmail && "invisible" ? "*****@*****" : value}
              </span>
              <IconButton onClick={() => copyToClipboard(value)
              } aria-label="copy icon">
                <Box display="flex" alignItems="center" justifyContent="center">
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
          ),
        },
        {
          ...sharedColDef,
          field: "offChainAddress",
          headerName: `${text("add_platform_header_off_chain_address")}`,
          width: 180,
          minWidth: 180,
          renderCell: ({ row }) => {
            const addr =
              row?.offChainAddress?.substr(0, 6) +
              "..." +
              row?.offChainAddress?.slice(-6);
            return (
              <div className="flex w-full justify-start">
                <span className="w-[110px] truncate text-ellipsis">{addr}</span>
                <Image
                  className="ml-5 cursor-pointer"
                  width={19}
                  height={19}
                  src="/images/copy-icon.svg"
                  alt="Copy Icon"
                  onClick={() => copyToClipboard(row.offChainAddress)}
                  aria-label="copy icon"
                />
              </div>
            );
          },
        },
        {
          ...sharedColDef,
          field: "url",
          headerName: `${text("platform_requests_column_header_url")}`,
          minWidth: 150,
        },
        {
          ...sharedColDef,
          field: "createdAt",
          headerName: `${text("platform_requests_column_header_created_at")}`,
          minWidth: 150,
          renderCell: ({ row }) => (
            <p className="truncate">
              <DateFormatter value={row.createdAt} breakLine />
            </p>
          ),
        },
        {
          ...sharedColDef,
          field: "action",
          headerName: `${text("platform_requests_column_header_action")}`,
          minWidth: 100,
          renderCell: ({ row }) => (
            <div className="flex">
              {row.status == 0 && (
                <div className="flex items-center justify-center">
                  <ButtonDeclinePlatform data={row} onUpdated={onUpdated} />
                  <ButtonApprovePlatform data={row} onUpdated={onUpdated} />
                </div>
              )}
              {row.status == 2 && (
                <div className="flex text-blue-600">
                  <CheckIcon className="w-5 stroke-2 mr-1" />
                  {text("platform_requests_row_action_approved")}
                </div>
              )}
              {row.status != 0 && row.status != 2 && (
                <div className="flex text-red-600">
                  <XMarkIcon className="w-5 stroke-2 mr-1" />
                  {text("platform_requests_row_action_declined")}
                </div>
              )}
            </div>
          ),
        },
      ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const sortableColumns = useMemo(
    () => columns.map((col) => ({ ...col, sortable: !!platforms.length })),
    [platforms, showEmail],
  );

  const handleDebouncedSearch = _debounce((value: string) => {
    setPlatforms([]);
    setSearchKey(value.trim().length === 0 ? undefined : value.trim());
  }, 500);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;
    // check if user scrolls down
    if (currentScrollTop > prevScrollTopRef.current && data && data.hasNext) {
      const el = document.querySelector(`div[data-id="${data.lastId}"]`);
      // if last element is in viewport, fetch more data
      if (el && inViewport(el)) {
        setPage((prev) => prev + 1);
      }
    }
    prevScrollTopRef.current = currentScrollTop;
  }, 500);

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("platformRequestColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 platforms-requests-header">
        <h4
          className="text-2xl font-medium"
          id={htmlIds.text_platforms_request_header}
        >
          {text("platform_requests_header")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("platform_requests_detail")}
        </span>
      </div>
      <div className="flex flex-wrap flex-col md:flex-row md:justify-between w-full gap-3 mb-5">
        <div className="xs:flex items-start">
          <SearchBox onChangeFunc={handleDebouncedSearch} />
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>

        <div className="flex">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
        </div>
      </div>
      <div
        className="w-full bg-white flex-grow"
        id={htmlIds.div_add_platforms_request_page_table_container}
        onScrollCapture={debouncedOnScroll}
      >
        <DataGridPro
          getRowId={(row) => row.uuid}
          rowCount={data?.platforms?.length ?? 0}
          rows={platforms}
          columns={sortableColumns}
          disableColumnReorder={!platforms.length}
          disableColumnMenu={!platforms.length}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
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

export default PlatformRequestsPage;