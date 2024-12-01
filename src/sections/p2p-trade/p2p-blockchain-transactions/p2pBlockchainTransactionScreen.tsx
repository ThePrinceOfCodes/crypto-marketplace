import {
  DataFilterType,
  DateFormatter,
  Pagination,
  ShowEmail,
  Spinner,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import {
  arrayToString,
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import {
  DataGridPro,
  GridColDef,
} from "@mui/x-data-grid-pro";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useDialog } from "@common/context";
import { toast } from "react-toastify";
import { IconButton, Box } from "@mui/material";
import { htmlIds } from "@cypress/utils/ids";
import {
  useGetP2pBlockchainTransaction,
  useUpdateP2pBlockchainTrans,
} from "api/hooks/p2p-blockchain-transactions";
import Image from "next/image";
import useResponsive from "@common/hooks/useResponsive";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import { usePostAdminHistoryLog } from "api/hooks";
import axios from "axios";
import { useRouter } from "next/router";
import { jsonToExcelDownload } from "@common/utils/excelutil";


const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function P2PBlockchainTransactionScreen() {
  const { timezone } = useTimezone();
  const { text } = useLocale();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [showEmail, setShowEmail] = useState(false);

  const { isBigScreen } = useResponsive();
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const divRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;


  const { data, isLoading, refetch, isRefetching } =
    useGetP2pBlockchainTransaction(
      {
        limit,
        page,
        from_date: dataFilter?.startDate,
        to_date: dataFilter?.endDate,
        status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
        searchKey: dataFilter?.searchKey?.length
          ? dataFilter?.searchKey
          : undefined,
      },
    );
  const { isLoading: isMassLoading, refetch: massRefetch } =
    useGetP2pBlockchainTransaction(
      {
        limit: data?.nbTotalElements,
        from_date: dataFilter?.startDate,
        to_date: dataFilter?.endDate,
        status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
        searchKey: dataFilter?.searchKey?.length
          ? dataFilter?.searchKey
          : undefined,
      },
      { enabled: false },
    );

  const { mutateAsync: updateP2pBlockchainTransApi } =
    useUpdateP2pBlockchainTrans();

  const p2pBlockchainTransactionWithIndex = useMemo(
    () =>
      data?.dataList.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [],
    [data?.dataList, limit, page],
  );
  const { confirmDialog } = useDialog();

  const copyToClipboard = useCallback(
    (textToCopy: string) => {
      navigator?.clipboard.writeText(textToCopy);
      toast(text("add_platform_copied_to_clipboard"), {
        type: "success",
      });
    },
    [text],
  );

  const getStatusTextAndColor = useCallback(
    (value: number) => {
      let statusText = "";
      let color: string | undefined;
      switch (value) {
        case 0:
          statusText = text("p2p_blockchain_transaction_status_waiting");
          color = "text-blue-400";
          break;
        case 1:
          statusText = text("p2p_blockchain_transaction_status_confirmed");
          color = "text-green-400";
          break;
        case 2:
          statusText = text("p2p_blockchain_transaction_status_rejected");
          color = "text-red-400";
          break;
        case 3:
          statusText = text("p2p_blockchain_transaction_status_resent");
          color = "text-orange-400";
          break;
        default:
          break;
      }
      return { statusText, color };
    },
    [text],
  );

  const handleExcelDownload = async () => {
    const { data } = await massRefetch();
    const BlockchainTransactions = data?.dataList || [];
    jsonToExcelDownload(
      BlockchainTransactions.map((item, index) => ({
        [text("p2p_blockchain_transaction_no_column_title")]: index + 1,
        [text("p2p_blockchain_transaction_id_column_title")]: item.id,
        [text("p2p_blockchain_transaction_order_id_column_title")]:
          item.order_id,
        [text("p2p_blockchain_transaction_user_email_column_title")]:
          item.email,
        [text("p2p_blockchain_transaction_price_column_title")]:
          formatNumberWithCommas(item.price, 3) + " " + (item.currency),
        [text("p2p_blockchain_transaction_from_wallet_column_title")]:
          item.from_wallet,
        [text("p2p_blockchain_transaction_to_wallet_column_title")]:
          item.to_wallet,
        [text("p2p_blockchain_transaction_tx_hash_column_title")]: item.tx_hash,
        [text("p2p_blockchain_transaction_type_column_title")]: item.type,
        [text("p2p_blockchain_transaction_status_column_title")]:
          getStatusTextAndColor(item.status).statusText,
        [text("p2p_blockchain_transaction_created_at_column_title")]:
          item.createdAt &&
          formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone),
        [text("p2p_blockchain_transaction_updated_at_column_title")]:
          item.updatedAt &&
          formatDateAndTime(item.updatedAt, "YYYY-MM-DD HH:mm:ss", timezone),
      })),
      `${arrayToString([
        text("p2p_blockchain_transaction_page_title"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([
          text("p2p_blockchain_transaction_page_title"),
          formatDate(new Date()),
        ]) + ".xlsx",
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("p2p_blockchain_transaction_no_column_title"),
        minWidth: 80,
      },
      {
        ...sharedColDef,
        field: "id",
        headerName: text("p2p_blockchain_transaction_id_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {value || "---"}
            </span>
            {value && (
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
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "order_id",
        headerName: text("p2p_blockchain_transaction_order_id_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {value || "---"}
            </span>
            {value && (
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
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "email",
        headerName: `${text(
          "p2p_blockchain_transaction_user_email_column_title",
        )}`,
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {!showEmail && "invisible" ? "*****@*****" : value}
            </span>
            <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
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
        field: "price",
        headerName: text("p2p_blockchain_transaction_price_column_title"),
        minWidth: 150,
        renderCell: ({ value, row }) => (
          <div className="flex items-center gap-2">
            <span>{formatNumberWithCommas(value, 3)} </span>
            <span>{(row.currency)} </span>

          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "from_wallet",
        headerName: text("p2p_blockchain_transaction_from_wallet_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {value || "---"}
            </span>
            {value && (
              <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
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
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "to_wallet",
        headerName: text("p2p_blockchain_transaction_to_wallet_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {value || "---"}
            </span>
            {value && (
              <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
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
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "tx_hash",
        headerName: text("p2p_blockchain_transaction_tx_hash_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {value || "---"}
            </span>
            {value && (
              <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
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
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "type",
        headerName: text("p2p_blockchain_transaction_type_column_title"),
        minWidth: 100,
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: text("p2p_blockchain_transaction_status_column_title"),
        minWidth: 150,
        renderCell: ({ value }) => {
          const { statusText, color } = getStatusTextAndColor(value);
          return <p className={color}>{statusText}</p>;
        },
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("p2p_blockchain_transaction_created_at_column_title"),
        minWidth: 150,
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: text("p2p_blockchain_transaction_updated_at_column_title"),
        minWidth: 150,
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("p2p_blockchain_transaction_action_column_title"),
        minWidth: 120,
        width: 120,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              id={`${htmlIds.btn_p2p_blockchain_transaction_action_retry}_${row.no}`}
              onClick={() => handleRetry(row)}
              disabled={row.status !== 2}
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md ${row.status !== 2
                  ? "bg-orange-300  cursor-not-allowed"
                  : "bg-orange-500"
                }`}
            >
              {text("p2p_blockchain_transaction_retry")}
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
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
  } = useGridColumnChange("P2pBlackchainTransactionState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  const handleDataFilterChange = useCallback(
    (e: DataFilterType) => {
      setPage(1);
      router.push({
        pathname: router.pathname, // The current path
        query: {
          ...Object.fromEntries(
            Object.entries({
              ...router.query,
              ...e,
            }).filter(
              // eslint-disable-next-line
              ([_, v]) => v !== undefined && v !== null && v.length !== 0,
            ),
          ),
        },
      });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.usdt_status,
      router.query.status,
      router.query.searchKey,
    ],
  );

  const handleRetry = async (row: any) => {
    const id = row.id;
    confirmDialog({
      title: text("p2p_blockchain_transaction_retry_confirmation_title"),
      content: text("p2p_blockchain_transaction_retry_modal_content"),
      onOk: async () => {
        try {
          await updateP2pBlockchainTransApi({ id });
          toast.success(text("p2p_blockchain_transaction_resend_response"));
          refetch();
        } catch (err) {
          if (axios.isAxiosError(err)) {
            toast.error(
              err.response?.data.msg ||
              err.response?.data.message ||
              " Error Occured",
            );
          } else {
            toast.error(text("toast_error_something_went_wrong_try_again"));
          }
        }
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("p2p_blockchain_transaction_page_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("p2p_blockchain_transaction_page_subtitle")}
        </span>
      </div>

      <div
        className={`flex gap-1 border-b pb-3 ${!isBigScreen ? "justify-end" : ""
          }`}
      >
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

        <div></div>
      </div>

      <div className="flex flex-col flex-grow pt-3">
        <div className="flex flex-col md:flex-row justify-between">
          <div className={"flex items-center"}>
            {Object.keys(columnCurrentState).length > 0 && (
              <div className="flex">
                <SaveNResetButtons
                  saveHandler={() => setOpenConfirmDialog(true)}
                  resetHandler={handleResetDefault}
                />
              </div>
            )}
          </div>

          <div className="flex flex-row flex-wrap gap-2 justify-between md:justify-end items-end md:items-center pt-3 pb-2">
            {p2pBlockchainTransactionWithIndex.length > 0 && (
              <ShowToolbar
                showToolbar={showToolbar}
                setShowToolbar={setShowToolbar}
              />
            )}
            {p2pBlockchainTransactionWithIndex.length > 0 && (
              <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
            )}
            <button
              id={htmlIds.btn_p2p_blockchain_transaction_excel_download}
              disabled={isMassLoading || !data?.dataList?.length}
              onClick={handleExcelDownload}
              className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
            >
              {isMassLoading && <Spinner />}{" "}
              <span>{text("users_excel_download_title")}</span>
            </button>
          </div>
        </div>
        <div
          id={htmlIds.div_p2p_blockchain_transaction_table_container}
          className="w-full bg-white flex-grow mt-1"
        >
          <DataGridPro
            getRowId={(row) => row.id ?? row.no}
            rows={p2pBlockchainTransactionWithIndex}
            columns={columns}
            paginationMode="server"
            loading={isLoading || isRefetching}
            rowCount={p2pBlockchainTransactionWithIndex?.length}
            disableSelectionOnClick
            sx={customisedTableClasses}
            hideFooter
            autoHeight={!isLoading}
            apiRef={apiRef}
            onColumnOrderChange={() => handleColumnChange(false)}
            onSortModelChange={() => handleColumnChange(true)}
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
          />
          <Pagination
            limits={[25, 50, 75, 100]}
            limit={limit}
            onChangeLimit={setLimit}
            page={page}
            onChangePage={setPage}
            totalPages={data?.nbTotalPage}
            isFetching={isLoading}
          />
        </div>
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}
export default P2PBlockchainTransactionScreen;
