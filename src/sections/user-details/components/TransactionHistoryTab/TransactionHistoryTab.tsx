import { DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import {
  inViewport,
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Button, Switch } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { PDRefundModal } from "@sections/platform/platform-details/components/PDRefundModal";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { PaymentHistoryDetailsModal } from "@sections/user-details/components";
import { PayHistoryDetails, useGetUserTransactionHistory } from "api/hooks";
import { useLocale } from "locale";
import _debounce from "lodash/debounce";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { SearchBox } from "@common/components/SearchBox";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};

function TransactionHistoryTab() {
  const { text } = useLocale();
  const [enabled, setEnabled] = useState(false);
  const email = useRouter().query.email as string;
  const [open, setOpen] = useState(false);
  const [searchKey, setSearchKey] = useState<string>("");

  const prevScrollTopRef = useRef(0);
  const [transactionId, setTransactionId] = useState<string>("");
  const [payHistoryOpen, setPayHistoryOpen] = useState<{
    open: boolean;
    pay_history: PayHistoryDetails | null;
    previous_balance: number | null;
    new_balance: number | null;
  }>({
    open: false,
    pay_history: null,
    previous_balance: null,
    new_balance: null,
  });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const handleOnModalClose = () => {
    setOpen(false);
    setTransactionId("");
  };

  const { data, isLoading, isFetching, refetch, fetchNextPage } =
    useGetUserTransactionHistory({
      email,
      limit: 25,
      searchKey,
      includeDraft: enabled ? 1 : undefined,
    });

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

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
              createdAt: data?.createdAt,
              searchKey,
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
      }
    }, 500),
    [],
  );

  const onRefundLoad = useCallback(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "currency",
        headerName: text("users_transaction_history_header_token"),
        minWidth: 100,
        flex: 1,
        width: 150,
      },
      {
        ...sharedColDef,
        field: "amount",
        headerName: text("users_transaction_history_header_amount"),
        minWidth: 150,
        flex: 1,
        width: 150,
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
        headerName: text("users_transaction_history_header_date"),
        minWidth: 150,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const date = row.createdAt || row.createDate;
          return (
            <p className="truncate">
              <DateFormatter value={date} breakLine />
            </p>
          );
        },
      },
      {
        ...sharedColDef,
        field: "tx_action",
        headerName: text("users_transaction_history_header_method"),
        minWidth: 150,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => (
          <div
            className="bg-gray-200 p-2 h-7 flex justify-center items-center rounded-xl"
            id={row.tx_action}
          >
            {`${row.tx_action}`.toUpperCase()}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "from_user_id",
        headerName: text("users_transaction_history_header_from_user"),
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
        field: "to_user_id",
        headerName: text("users_transaction_history_header_to_user"),
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
        headerName: text("users_transaction_history_header_address"),
        minWidth: 180,
        flex: 1,
        width: 150,
        renderCell: ({ row }) => {
          const addr = row.to
            ? row.to.substring(0, 6) + "..." + row.to.slice(-6)
            : "---";
          return (
            <div className="flex">
              {addr}
              {row.to && (
                <Image
                  className="ml-5 cursor-pointer"
                  width={19}
                  height={19}
                  src="/images/copy-icon.svg"
                  alt="Copy Icon"
                  onClick={() => copyToClipboard(row.to)}
                />
              )}
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "tx_hash",
        headerName: text("users_transaction_history_header_tx_hash"),
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
        headerName: text("users_transaction_history_header_action"),
        minWidth: 160,
        flex: 1,
        width: 160,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row }) => {
          const isRefundDisable = !(row.tx_action === "qr" && row?.tx_status !== "refunded");
          const isDetailsDisable = !(row.tx_action == "MSQ-Pay" && row?.pay_history != null);
          const isDraft = row?.tx_status == "draft";
          return (
            <>
              <Button
                sx={{
                  "&.Mui-disabled": {
                    pointerEvents: "auto",
                    cursor: "not-allowed"
                  }
                }}
                disabled={isDetailsDisable}
                className={`flex items-center text-xs px-2 mx-2 h-6 rounded-md ${isDraft ? "text-red-500" : "text-[#3B82F6] border-[#3B82F6]"}`}
                onClick={() => {
                  setPayHistoryOpen({
                    open: true,
                    pay_history: row.pay_history,
                    previous_balance: row?.previous_balance,
                    new_balance: row?.new_balance,
                  });
                }}
                variant="outlined"
                color={isDraft ? "error" : "primary"}
              >
                {text(
                  "user_details_transaction_history_tab_pay_history_button",
                )}
              </Button>
              <button
                id={row.action}
                className={`flex items-center text-xs px-2 mx-2 h-6 text-white rounded-md 
                  ${isRefundDisable ? "bg-red-300  cursor-not-allowed" : "bg-red-500"}`}
                disabled={isRefundDisable}
                onClick={() => {
                  setTransactionId(row.uuid);
                  setOpen(true);
                }}
              >
                {text("platform_history_transactions_action_refund")}
              </button>
            </>
          );
        },
      },
      {
        ...sharedColDef,
        field: "tx_reason",
        headerName: `${text("platform_history_transactions_header_tx_memo")}`,
        minWidth: 180,
        flex: 1,
        width: 150,
        renderCell: ({ value }) => value ? <div className="truncate">{value}</div> : "---,"
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const userTransactionIndex =
    data?.user_transaction?.map((item) => ({ ...item })) || [];

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
  } = useGridColumnChange("transactionHistoryTabColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, searchKey]);

  return (
    <div>
      <div className={"flex justify-between items-center my-6"}>
        <div className="text-gray-400 text-xl lg:text-2xl  text-grey">
          {text("transaction_history_title")}
        </div>
        <div className={"flex flex-col-reverse lg:flex-row space-x-1 items-center"}>
          <div className=" lg:flex">
            <SearchBox onChangeFunc={onChangeSearch} />
          </div>
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
          <label aria-label="missed P2U earnings">
            <Switch
              checked={enabled}
              onClick={() => {
                setEnabled(!enabled);
              }}
            />
          </label>
          <Tooltip title={text("users_transaction_history_info")}>
            <InfoOutlinedIcon sx={{ color: "gray" }} />
          </Tooltip>
        </div>
      </div>
      <div
        onScrollCapture={debouncedOnScroll}
        className="w-full mt-2 bg-white tableContainer pb-10"
      >
        <DataGridPro
          rows={userTransactionIndex || []}
          rowCount={userTransactionIndex?.length || 0}
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
      <PDRefundModal
        open={open}
        transactionId={transactionId}
        onClose={handleOnModalClose}
        onSubmit={onRefundLoad}
      />
      <PaymentHistoryDetailsModal
        open={payHistoryOpen.open}
        onClose={() =>
          setPayHistoryOpen({
            open: false,
            pay_history: null,
            previous_balance: null,
            new_balance: null,
          })
        }
        pay_history={payHistoryOpen.pay_history}
        previous_balance={payHistoryOpen.previous_balance}
        new_balance={payHistoryOpen.new_balance}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default TransactionHistoryTab;
