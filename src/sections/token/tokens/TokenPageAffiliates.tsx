import { customisedTableClasses } from "@common/constants/classes";
import { Avatar } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useLocale } from "locale";
import _debounce from "lodash/debounce";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useGetTokensInfScroll } from "api/hooks";
import { ButtonAddToken } from "./components";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import Link from "next/link";
import { formatNumberWithCommas } from "@common/utils/formatters";
import { DateFormatter } from "@common/components";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { queryClient } from "api";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { SearchBox } from "@common/components/SearchBox";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { CustomImage } from "@common/components/CustomImage";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function TokenPageAffiliates() {
  const { text } = useLocale();
  const [searchKey, setSearchKey] = useState<string>("");
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const {
    data: infData,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useGetTokensInfScroll({ limit: 25, searchKey });

  const rowsData = useMemo(
    () => infData?.pages.flatMap((itm) => itm.allTokensData) || [],
    [infData],
  );

  const handleScrollEnd = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const copyToClipboard = useCallback(
    (textToCopy: string) => {
      navigator.clipboard.writeText(textToCopy);
      toast(text("add_platform_copied_to_clipboard"), {
        type: "success",
        autoClose: 1500,
      });
    },
    [text],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "name",
        headerName: `${text("token_column_header_token_name")}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return (
            <div className="flex items-center w-full justify-between">
              <CustomImage alt="token-image" src={row.logo} />
              <span className="pl-2 truncate w-[150px] flex-grow">
                {row.name}
              </span>
              <Link
                href={`/token-details?tokenName=${row.name}&address=${row.address}&onChain=${row.onChain}&swappable=${row.swappable}&totalTokens=${row.total_tokens}&platformId=${row.platform_id}&logo=${row.logo}&createdAt=${row.createdAt}`}
              >
                <Image
                  className="ml-4 mt-0.5 cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "address",
        headerName: `${text("token_column_header_address")}`,
        minWidth: 200,
        renderCell: ({ row }) => {
          const addr = row.address.substring(0, 6) + "..." + row.address.slice(-6);
          return (
            <div className="w-full flex justify-between items-center">
              {addr}
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.address)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "total_tokens",
        headerName: `${text("token_column_header_is_total_tokens")}`,
        minWidth: 100,
        type: "number",
        renderCell: ({ row }) => (
          <span>{formatNumberWithCommas(row.total_tokens?.toFixed(2))}</span>
        ),
      },
      {
        ...sharedColDef,
        field: "onChain",
        headerName: `${text("token_column_header_is_onChain")}`,
        type: "boolean",
        minWidth: 100,
        renderCell: ({ row }) => <span>{row.onChain ? "true" : "false"}</span>,
      },
      {
        ...sharedColDef,
        field: "swappable",
        headerName: `${text("token_column_header_is_swappable")}`,
        type: "boolean",
        minWidth: 100,
        renderCell: ({ row }) => (
          <span>{row.swappable ? "true" : "false"}</span>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: `${text("token_column_header_created_at")}`,
        type: "date",
        minWidth: 150,

        // renderCell: ({ row }) => formatDate(row.createdAt,true),
        renderCell: ({ row }) =>
          row.createdAt && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={row.createdAt} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: `${text("token_column_header_updated_at")}`,
        minWidth: 150,
        type: "date",
        renderCell: ({ row }) =>
          row.updatedAt && (
            <span className="whitespace-normal w-fit">
              <DateFormatter value={row.updatedAt} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "isApproved",
        headerName: `${text("token_column_header_status")}`,
        minWidth: 120,
        renderCell: ({ row }) => {
          if (row.isApproved) {
            return (
              <div className="bg-green-200 text-green-600 py-1.5 px-3.5 rounded-md font-medium">
                {text("token_column_header_status_approved")}
              </div>
            );
          } else {
            return (
              <div className="bg-red-200 text-red-600 py-1.5 px-3.5 rounded-md font-medium">
                {text("token_column_header_status_un_approved")}
              </div>
            );
          }
        },
      },
    ],
    [text, copyToClipboard],
  );

  const sortableColumns = useMemo(
    () => columns.map((col) => ({ ...col, sortable: !!rowsData.length })),
    [rowsData],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeSearch = useCallback(
    _debounce((text: string) => {
      if (text.trim().length >= 3 || text.trim().length === 0) {
        setSearchKey(text.trim());
        document
          ?.querySelector?.(".MuiDataGrid-virtualScroller")
          ?.scrollTo?.({ top: 0 });
      }
    }, 500),
    [],
  );

  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("tokenColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, searchKey]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 tokens-header">
        <h4 className="text-2xl font-medium">{text("token_title")}</h4>
        <span className="text-slate-500 text-sm">{text("token_details")}</span>
      </div>
      <div className="flex flex-wrap flex-col md:items-center md:flex-row gap-3 justify-between w-full mb-5">
        <div className="xs:flex items-start">
          <SearchBox onChangeFunc={onChangeSearch} />
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
          <ButtonAddToken
            onAdded={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["infScrollToken"],
              });
            }}
          />
        </div>
      </div>
      <div
        id={htmlIds.div_add_token_page_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          getRowId={(row) => row.name}
          rows={rowsData}
          onRowsScrollEnd={handleScrollEnd}
          columns={sortableColumns}
          disableColumnReorder={!rowsData.length}
          disableColumnMenu={!rowsData.length}
          loading={isFetching || isLoading}
          disableSelectionOnClick
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

export default TokenPageAffiliates;
