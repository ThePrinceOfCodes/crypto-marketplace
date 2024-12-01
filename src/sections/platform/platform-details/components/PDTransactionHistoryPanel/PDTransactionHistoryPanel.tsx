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
  iGetTransactionsHistoryResp,
  useGetTransactionsHistory,
} from "api/hooks";
import {
  inViewport,
  resetMUIToolbarFilter
} from "@common/utils/helpers";
import { Button } from "@mui/material";
import { PDRefundModal } from "../PDRefundModal";
import { DateFormatter } from "@common/components";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { SearchBox } from "@common/components/SearchBox";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1
};

function PDTransactionHistoryPanel() {
  const { text } = useLocale();
  const router = useRouter();
  const prevScrollTopRef = useRef(0);
  const [searchKey, setSearchKey] = useState<string>("");
  const [transactions, setTransactions] = useState<
    iGetTransactionsHistoryResp["transactions"]
  >([]);
  const [lastId, setLastId] = useState<string>();
  const [createdAt, setCreatedAt] = useState<string>();

  const [open, setOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  const handleOnModalClose = () => {
    setOpen(false);
    setTransactionId("");
  };

  const { data, isLoading, isFetching, refetch } = useGetTransactionsHistory(
    {
      platformId: router.query.platform as string,
      limit: 10,
      searchKey,
      lastId,
      createdAt,
    },
    {
      onSuccess: (res) => {
        setTransactions((trans) => [
          ...(lastId !== undefined ? trans : []),
          ...res.transactions,
        ]);
      },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;
    // check if user scrolls down
    if (currentScrollTop > prevScrollTopRef.current && data && data.hasNext) {
      const el = document.querySelector(`div[data-id="${data.lastId}"]`);
      // if last element is in viewport, fetch more data
      if (el && inViewport(el)) {
        setLastId(data?.lastId);
        setCreatedAt(data?.createdAt);
      }
    }
    prevScrollTopRef.current = currentScrollTop;
  }, 500);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeSearch = useCallback(
    _debounce((text: string) => {
      if (text.trim().length >= 3 || text.trim().length === 0) {
        setSearchKey(text.trim());
        setLastId(undefined);
        setCreatedAt(undefined);
      }
    }, 500),
    [],
  );

  const onRefundLoad = useCallback(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "currency",
        headerName: `${text("platform_history_transactions_header_token")}`,
        minWidth: 100,
        flex: 1,
        width: 150,
      },
      {
        ...sharedColDef,
        field: "amount",
        headerName: `${text("platform_history_transactions_header_amount")}`,
        minWidth: 120,
        flex: 1,
        width: 120,
        renderCell: ({ row }) => (
          <div
            className={row.type === "out" ? "text-red-500" : "text-green-500"}
            id={row.amount}
          >
            {row.type === "out" ? "-" : "+"}
            {row.amount?.toFixed(2)}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "createDate",
        headerName: `${text("platform_history_transactions_header_date")}`,
        minWidth: 150,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const date = row.createdAt || row.createDate;
          return (
            <div id={date}>
              <DateFormatter value={date} breakLine />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "tx_action",
        headerName: `${text("platform_history_transactions_header_method")}`,
        minWidth: 150,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => (
          <div
            className="bg-gray-200 w-28 h-7 flex justify-center items-center rounded-xl"
            id={row.tx_action}
          >
            {row.tx_action}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "to_user_id",
        headerName: text("platform_history_transactions_header_from_user"),
        minWidth: 210,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const addr =
            row.from_user_id.substring(0, 6) + "..." + row.from_user_id.slice(-6);
          return (
            <div className="flex">
              {addr}
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.from_user_id)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "from_user_id",
        headerName: text("platform_history_transactions_header_to_user"),
        minWidth: 210,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const addr =
            row.to_user_id.substring(0, 6) + "..." + row.to_user_id.slice(-6);
          return (
            <div className="flex">
              {addr}
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.to_user_id)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "to",
        headerName: `${text("platform_history_transactions_header_address")}`,
        minWidth: 180,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const addr = row.to.substring(0, 6) + "..." + row.to.slice(-6);
          return (
            <div className="flex">
              {addr}
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.to)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "tx_hash",
        headerName: `${text("platform_history_transactions_header_tx_hash")}`,
        minWidth: 180,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const addr = row.tx_hash.substring(0, 6) + "..." + row.tx_hash.slice(-6);
          return (
            <div className="flex">
              {addr}
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.tx_hash)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: `${text("platform_history_transactions_header_action")}`,
        minWidth: 70,
        flex: 1,
        width: 100,
        renderCell: ({ row }) =>
          row.tx_action === "qr" &&
          row?.tx_status !== "refunded" ? (
            <Button
              id={row.action}
              variant="contained"
              color="error"
              className="bg-red-600"
              onClick={() => {
                setTransactionId(row.uuid);
                setOpen(true);
              }}
            >
              {text("platform_history_transactions_action_refund")}
            </Button>
          ) : (
            "---"
        ),
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const userTransactionIndex = useMemo(
    () => transactions.map((item, index) => ({ ...item, no: index + 1 })),
    [transactions],
  );

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
  } = useGridColumnChange("pdTransactionHistoryColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, searchKey]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-2 w-full mb-5">
        <div className="w-full xl:w-60">
          <SearchBox onChangeFunc={onChangeSearch} />
        </div>
        <div className="flex flex-col md:flex-row items-end gap-2">
          <div className="flex">
            {Object.keys(columnCurrentState).length > 0 && (
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            )}
          </div>
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
        </div>
      </div>
      <div
        className="w-full h-full bg-white transactions-history-container"
        onScrollCapture={debouncedOnScroll}
      >
        <DataGridPro
          paginationMode="server"
          getRowId={(row) => row.uuid}
          rows={userTransactionIndex || []}
          columns={columns}
          loading={isFetching || isLoading}
          disableSelectionOnClick
          sx={customisedTableClasses}
          rowCount={userTransactionIndex?.length || 0}
          hideFooter
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
      <PDRefundModal
        open={open}
        transactionId={transactionId}
        onClose={handleOnModalClose}
        onSubmit={onRefundLoad}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default PDTransactionHistoryPanel;
