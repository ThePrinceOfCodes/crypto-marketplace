import { DataFilterType, DateFormatter, Pagination, Spinner } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useGetCashTransferInformation,
  useMassGetCashTransferInformation,
  usePostAdminHistoryLog,
} from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import { arrayToString, resetMUIToolbarFilter, useCopyToClipboard } from "@common/utils/helpers";
import Image from "next/image";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { useTimezone } from "@common/hooks";
import { Tooltip } from "@mui/material";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import { formatDate, formatDateAndTime, formatNumberWithCommas } from "@common/utils/formatters";
import { ICashTransfer } from "api/hooks/cash-transfer/types";
import Link from "next/link";
import isNil from "lodash/isNil";

const sharedColDef: GridColDef = {
  field: "",
  flex: 1,
};

function CashTransferScreen() {
  const { text } = useLocale();
  const { timezone } = useTimezone();
  const copyToClipboard = useCopyToClipboard();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const divRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;

  const { data, isFetching } = useGetCashTransferInformation(
    {
      limit,
      page,
      searchKey:
        (dataFilter?.searchKey?.length || 0) > 0
          ? dataFilter?.searchKey
          : undefined,
      from_date: dataFilter?.startDate,
      to_date: dataFilter?.endDate,
    }
  );

  useEffect(() => {
    if (divRef.current) {
        divRef.current.scrollTop = 0;
    }
}, [page]);

  const { mutateAsync: getMassCashTransfer, isLoading: massDownloadLoading } = useMassGetCashTransferInformation();
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("super_save_cash_transfer_name_no"),
        type: "number",
        minWidth: 40,
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("super_save_cash_transfer_name"),
        minWidth: 90,
        renderCell: ({ value }) => {
          return (
            <Tooltip title={value} arrow placement="top">
              <Link
                href={`/super-save/deposit-information?searchKey=${value}`}
                target="_blank"
                className="flex w-full justify-between"
              >
                <span className="truncate w-fit ">{value}</span>
                <Image
                  className="ml-2 mt-0.5 cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </Tooltip>
          );
        },
      },
      {
        ...sharedColDef,
        field: "amount",
        headerName: text("super_save_cash_transfer_amount"),
        minWidth: 120,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-start">
            {`${formatNumberWithCommas(value, 3)} ${text("korean_currency_name")}`}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "super_save_request_id",
        headerName: text("super_save_cash_transfer_super_save_request_id"),
        minWidth: 150,
        renderCell: ({ value }) => {
          return value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit mr-5 truncate text-ellipsis">{value}</span>
              {value !== "waiting" && (
                <Image
                  className="cursor-pointer"
                  alt=""
                  width={17}
                  height={17}
                  src="/images/copy-icon.svg"
                  onClick={() => copyToClipboard(value)}
                />
              )}
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "bank_account_number",
        headerName: text("user_details_bank_details_tab_bank_account_number"),
        minWidth: 170,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit mr-5 truncate text-ellipsis">{value}</span>
              <Image
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "sms_sender",
        headerName: text("super_save_cash_transfer_sms_sender"),
        minWidth: 170,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit mr-5 truncate text-ellipsis">{value}</span>
              <Image
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "sms_plain",
        headerName: text("super_save_cash_transfer_sms_plain"),
        minWidth: 200,
        renderCell: (params) => (
          <Tooltip title={params.value || ""} arrow>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {params.value}
            </span>
          </Tooltip>
        ),
      },
      {
        ...sharedColDef,
        field: "time",
        headerName: text("super_save_cash_transfer_time"),
        minWidth: 90,
      },
      {
        ...sharedColDef,
        field: "date",
        headerName: text("super_save_cash_transfer_Date"),
        minWidth: 100,
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("super_save_cash_transfer_createdAt"),
        minWidth: 100,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "created_by",
        headerName: text("super_save_cash_transfer_created_by"),
        minWidth: 100,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );


  const handleDataFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const cashTransferWithIndex = useMemo(
    () => (data?.cashDepositHistory || []).map((item, index) => ({
       ...item,
       no: limit * (page - 1) + index + 1,
      })),
    [data?.cashDepositHistory, limit, page],
  );

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
  } = useGridColumnChange("cashTransferColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  const handleExcelDownload = (cashDepositHistory: ICashTransfer[]) => {
    jsonToExcelDownload(
      cashDepositHistory?.map((item, index) => ({
        [text("super_save_cash_transfer_name_no")]: index + 1,
        [text("super_save_cash_transfer_name")]: item?.name,
        [text("super_save_cash_transfer_amount")]: isNil(item?.amount) ? "---" : `${formatNumberWithCommas(item?.amount, 3)} ${text("korean_currency_name")}`,
        [text("super_save_cash_transfer_super_save_request_id")]: item?.super_save_request_id || "---",
        [text("user_details_bank_details_tab_bank_account_number")]: item?.bank_account_number || "---",
        [text("super_save_cash_transfer_sms_sender")]: item?.sms_sender || "---",
        [text("super_save_cash_transfer_sms_plain")]: item?.sms_plain || "---",
        [text("super_save_cash_transfer_time")]: item?.time || "---",
        [text("super_save_cash_transfer_Date")]: item?.date || "---",
        [text("super_save_cash_transfer_createdAt")]: item?.createdAt
          ? formatDateAndTime(item?.createdAt, "YYYY-MM-DD HH:mm:ss", timezone)
          : "",
        [text("super_save_cash_transfer_created_by")]: item?.created_by || "---",
      })),
      `${arrayToString([
        text("cash_trasfer_information_title"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([
          text("cash_trasfer_information_title"),
          formatDate(new Date()),
        ]) + ".xlsx",
    });
  };

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div ref={divRef} className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("cash_trasfer_information_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("cash_trasfer_information_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex  flex-wrap gap-1 justify-between items-center py-3">
        <div>
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex flex-wrap">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />

          <button
            id={htmlIds.btn_users_excel_download}
            disabled={massDownloadLoading}
            onClick={() => {
              getMassCashTransfer(
                {
                  searchKey: dataFilter?.searchKey,
                  from_date: dataFilter?.startDate,
                  to_date: dataFilter?.endDate,
                },
                {
                  onSuccess: (_data) => {
                    _data?.cashDepositHistory &&
                      handleExcelDownload(_data?.cashDepositHistory);
                  },
                },
              );
            }}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {massDownloadLoading && <Spinner />}{" "}
            <span>{text("users_excel_download_title")}</span>
          </button>
        </div>
      </div>

      <div
        id={htmlIds.div_bug_report_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={cashTransferWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={cashTransferWithIndex.length}
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
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
          isFetching={isFetching}
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

export default CashTransferScreen;
