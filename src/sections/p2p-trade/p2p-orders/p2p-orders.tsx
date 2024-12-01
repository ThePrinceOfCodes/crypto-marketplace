import {
  DataFilterType,
  DateFormatter,
  Pagination,
  ShowEmail,
  Spinner,
} from "@common/components";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useTimezone } from "@common/hooks";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import {
  arrayToString,
  resetMUIToolbarFilter,
  useCopyToClipboard,
} from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import { Box, Chip, IconButton } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { usePostAdminHistoryLog } from "api/hooks";
import { useDeleteP2pOrders, useGetP2pOrders } from "api/hooks/p2p-orders";
import axios from "axios";
import { useLocale } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import ExtraFilters from "../components/ExtraFilters.tsx/ExtraFilters";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const P2pOrders = () => {
  const { text } = useLocale();
  const { timezone } = useTimezone();
  const { confirmDialog } = useDialog();
  const copyToClipboard = useCopyToClipboard();

  const divRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;

  const [showEmail, setShowEmail] = useState(false);
  const [colRemoved, setColRemoved] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const [isBuy, setIsBuy] = useState<string>(
    (router.query.isBuy as string) || "all",
  );

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const { mutateAsync: deleteP2pOrdersApi } = useDeleteP2pOrders();
  const {
    data: p2pOrders,
    isLoading,
    refetch,
    isRefetching,
  } = useGetP2pOrders({
    limit,
    page,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
    status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
    searchKey: dataFilter?.searchKey?.length
      ? dataFilter?.searchKey
      : undefined,
    isBuy: dataFilter?.isBuy,
  });

  const { isLoading: isMassLoading, refetch: massRefetch } = useGetP2pOrders(
    {
      limit: p2pOrders?.nbTotalElements,
      from_date: dataFilter?.startDate,
      to_date: dataFilter?.endDate,
      status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
      searchKey: dataFilter?.searchKey?.length
        ? dataFilter?.searchKey
        : undefined,
      isBuy: dataFilter?.isBuy,
    },
    { enabled: false },
  );

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  const handleDataFilterChange = useCallback(
    (e: DataFilterType) => {
      setPage(1);
      const updatedFilter =
        !e.startDate && !e.endDate && !e.isBuy
          ? { startDate: e.startDate, endDate: e.endDate, isBuy: e.isBuy }
          : undefined;
      router.push({
        pathname: router.pathname,
        query: {
          ...Object.fromEntries(
            Object.entries({
              ...router.query,
              ...e,
              ...updatedFilter,
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
      router.query.memberType,
      router.query.isBuy,
    ],
  );

  const handleExcelDownload = async () => {
    const { data } = await massRefetch();
    const orders = data?.dataList || [];
    jsonToExcelDownload(
      orders.map((item, index) => ({
        [text("p2p_orders_list_column_title_no")]: index + 1,
        [text("p2p_orders_list_column_title_id")]: item.id,
        [text("p2p_orders_list_column_title_created_by")]: item.createdBy,
        [text("p2p_orders_list_column_title_price")]:
          formatNumberWithCommas(item.price, 3) + " " + item.currency,
        [text("p2p_orders_list_column_title_deposit_tx_id")]: item.depositTxID,
        [text("p2p_orders_list_column_title_wallet")]: item.wallet,
        [text("p2p_orders_list_column_title_tx_id")]: item.txID,
        [text("p2p_orders_list_column_title_fee")]: formatNumberWithCommas(
          item.fee,
          3,
        ),
        [text("p2p_orders_list_column_title_fee_tx_id")]: item.feeTxID,
        [text("p2p_orders_list_column_title_is_complete_creator")]:
          item.isCompleteCreator
            ? text("p2p_orders_list_column_value_yes")
            : text("p2p_orders_list_column_value_no"),
        [text("p2p_orders_list_column_title_completed_by")]: item.completedBy,
        [text("p2p_orders_list_column_title_completed_wallet")]:
          item.completedWallet,
        [text("p2p_orders_list_column_title_completed_tx_id")]:
          item.completedTxID,
        [text("p2p_orders_list_column_title_completed_fee")]:
          formatNumberWithCommas(item.completedFee, 3),
        [text("p2p_orders_list_column_title_withdrawal_tx_id")]:
          item.withdrawalTxID,
        [text("p2p_orders_list_column_title_is_complete")]: item.isComplete
          ? text("p2p_orders_list_column_value_yes")
          : text("p2p_orders_list_column_value_no"),
        [text("p2p_orders_list_column_title_is_buy")]: item.isBuy
          ? text("p2p_orders_list_column_value_yes")
          : text("p2p_orders_list_column_value_no"),
        [text("p2p_orders_list_column_title_base_amount")]:
          formatNumberWithCommas(item.baseAmount, 3) + " " + item.baseCurrency,
        [text("p2p_orders_list_column_title_created_at")]:
          item.createdAt &&
          formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone),
        [text("p2p_orders_list_column_title_updated_at")]:
          item.updatedAt &&
          formatDateAndTime(item.updatedAt, "YYYY-MM-DD HH:mm:ss", timezone),
      })),
      `${arrayToString([
        text("p2p_orders_file_name"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([text("p2p_orders_file_name"), formatDate(new Date())]) +
        ".xlsx",
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("p2p_orders_list_column_title_no"),
        minWidth: 50,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "id",
        headerName: text("p2p_orders_list_column_title_id"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">{value}</span>
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
        ),
      },
      {
        ...sharedColDef,
        field: "createdBy",
        headerName: text("p2p_orders_list_column_title_created_by"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full justify-between items-center">
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
        headerName: text("p2p_orders_list_column_title_price"),
        minWidth: 150,
        renderCell: ({ value, row }) => (
          <div className="flex items-center gap-2">
            <span>{formatNumberWithCommas(value, 3)} </span>
            <span>{row.currency}</span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "depositTxID",
        headerName: text("p2p_orders_list_column_title_deposit_tx_id"),
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
        field: "wallet",
        headerName: text("p2p_orders_list_column_title_wallet"),
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
        field: "txID",
        headerName: text("p2p_orders_list_column_title_tx_id"),
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
        field: "fee",
        headerName: text("p2p_orders_list_column_title_fee"),
        minWidth: 150,
        renderCell: ({ value }) => formatNumberWithCommas(value, 3),
      },
      {
        ...sharedColDef,
        field: "feeTxID",
        headerName: text("p2p_orders_list_column_title_fee_tx_id"),
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
        field: "isCompleteCreator",
        headerName: text("p2p_orders_list_column_title_is_complete_creator"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <Chip
            label={
              value
                ? text("p2p_orders_list_column_value_yes")
                : text("p2p_orders_list_column_value_no")
            }
            size="small"
            color={value ? "success" : "default"}
          />
        ),
      },
      {
        ...sharedColDef,
        field: "completedBy",
        headerName: text("p2p_orders_list_column_title_completed_by"),
        minWidth: 200,
        renderCell: ({ value }) =>
          value ? (
            <div className="flex w-full justify-between items-center">
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
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "completedWallet",
        headerName: text("p2p_orders_list_column_title_completed_wallet"),
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
        field: "completedTxID",
        headerName: text("p2p_orders_list_column_title_completed_tx_id"),
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
        field: "completedFee",
        headerName: text("p2p_orders_list_column_title_completed_fee"),
        minWidth: 150,
        renderCell: ({ value }) => formatNumberWithCommas(value, 3),
      },
      {
        ...sharedColDef,
        field: "withdrawalTxID",
        headerName: text("p2p_orders_list_column_title_withdrawal_tx_id"),
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
        field: "isComplete",
        headerName: text("p2p_orders_list_column_title_is_complete"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <Chip
            label={
              value
                ? text("p2p_orders_list_column_value_yes")
                : text("p2p_orders_list_column_value_no")
            }
            size="small"
            color={value ? "success" : "default"}
          />
        ),
      },
      {
        ...sharedColDef,
        field: "isBuy",
        headerName: text("p2p_orders_list_column_title_is_buy"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <Chip
            label={
              value
                ? text("p2p_orders_list_column_value_yes")
                : text("p2p_orders_list_column_value_no")
            }
            size="small"
            color={value ? "info" : "default"}
          />
        ),
      },
      {
        ...sharedColDef,
        field: "baseAmount",
        headerName: text("p2p_orders_list_column_title_base_amount"),
        minWidth: 200,
        renderCell: ({ value, row }) => (
          <div className="flex items-center gap-2">
            <span>{formatNumberWithCommas(value, 3)}</span>
            <span>{row.baseCurrency}</span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("p2p_orders_list_column_title_created_at"),
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
        headerName: text("p2p_orders_list_column_title_updated_at"),
        minWidth: 150,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("p2p_orders_list_column_title_action"),
        minWidth: 100,
        width: 100,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              id={`${htmlIds.btn_p2p_orders_action_delete}_${row.no}`}
              onClick={() => handleDelete(row.id as string)}
              disabled={row.isComplete}
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md ${row.isComplete ? "bg-red-300" : "bg-red-500"
                }`}
            >
              {text("p2p_orders_list_column_value_delete")}
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const p2pOrdersDataWithIndex = useMemo(
    () =>
      p2pOrders?.dataList?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [],
    [p2pOrders?.dataList, page, limit],
  );

  const removeColumns = useMemo(() => {
    return columns.filter(
      (column) => !colRemoved.includes(column.field as string),
    );
  }, [colRemoved, columns]);

  const handleDelete = (id: string) => {
    confirmDialog({
      title: text("p2p_orders_list_page_item_delete_confirmation_title"),
      content: text("p2p_orders_list_page_item_delete_confirmation_content"),
      onOk: async () => {
        try {
          await deleteP2pOrdersApi({ id });
          toast.success(text("p2p_orders_list_page_item_deleted_success"));
          setTimeout(() => {
            refetch();
          }, 1000);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            toast.error(err.response?.data.msg);
          } else {
            toast.error(text("toast_error_something_went_wrong_try_again"));
          }
        }
      },
    });
  };

  const {
    apiRef,
    restoreOrder,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("p2pOrdersColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div ref={divRef} className="flex flex-col gap-3 h-full p-5">
      <div className="border-b pb-3">
        <h4 className="text-2xl font-medium">
          {text("p2p_orders_list_page_header_title")}
        </h4>
        <p className="text-slate-500 text-sm font-light">
          {text("p2p_orders_list_page_header_subtitle")}
        </p>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-end gap-1">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex flex-wrap">
          {p2pOrdersDataWithIndex.length > 0 && (
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
          )}
          {p2pOrdersDataWithIndex.length > 0 && (
            <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
          )}
          <ExtraFilters
            onChange={handleDataFilterChange}
            isBuy={isBuy}
            setIsBuy={setIsBuy}
          />
          <button
            id={htmlIds.btn_p2p_orders_excel_download}
            disabled={isMassLoading || !p2pOrders?.dataList?.length}
            onClick={handleExcelDownload}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {isMassLoading && <Spinner />}{" "}
            <span>{text("users_excel_download_title")}</span>
          </button>
        </div>
      </div>

      <div
        id={htmlIds.div_p2p_orders_table_container}
        className="w-full bg-white tableContainer"
      >
        <DataGridPro
          getRowId={(row) => row.id ?? row.no}
          rows={p2pOrdersDataWithIndex}
          columns={removeColumns}
          paginationMode="server"
          loading={isLoading || isRefetching}
          rowCount={p2pOrdersDataWithIndex.length}
          sx={customisedTableClasses}
          hideFooter
          disableSelectionOnClick
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
          totalPages={p2pOrders?.nbTotalPage}
          isFetching={isLoading}
        />
      </div>
    </div>
  );
};

export default P2pOrders;
