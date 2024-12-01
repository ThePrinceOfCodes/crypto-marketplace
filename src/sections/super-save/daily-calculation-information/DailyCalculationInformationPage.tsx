import {
  DataFilterType,
  Pagination,
  DateFormatter,
  ShowEmail,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import { useLocale } from "locale";
import {
  arrayToString,
  useCopyToClipboard,
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import {
  DataGridPro,
  GridColDef,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IDailyCalculationUser,
  iGetDailyCalculationRsq,
  useGetDailyCalculation,
  usePostAdminHistoryLog,
} from "api/hooks";
import Image from "next/image";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { htmlIds } from "@cypress/utils/ids";
import { useTimezone } from "@common/hooks";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function DailyCalculationInformationPage({
  user_id,
}: {
  user_id: string | undefined;
}) {
  const copyToClipboard = useCopyToClipboard();
  const divRef = useRef<HTMLDivElement>(null);
  const { text } = useLocale();
  const { timezone } = useTimezone();

  const [showEmail, setShowEmail] = useState(false);
  const [currency, setCurrency] =
    useState<iGetDailyCalculationRsq["type"]>("KRW");
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { isLoading, isFetching, data } = useGetDailyCalculation({
    limit,
    searchKey:
      (dataFilter?.searchKey?.length || 0) > 0
        ? dataFilter?.searchKey
        : undefined,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
    page,
    user_id: user_id,
    type: currency,
  });

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const handleExcelDownload = React.useCallback(
    (data: IDailyCalculationUser[]) => {
      jsonToExcelDownload(
        data
          .filter((rowVal) => rowVal.payment_currency === currency)
          .map((item, index) => ({
            [text("withdrawal_information_header_no")]: index + 1,
            [text("withdrawal_information_header_name")]: item.name,
            [text("withdrawal_information_header_user_id")]: item.user_id,
            [text("withdrawal_information_header_email")]: item.email,
            [text("withdrawal_information_header_daily_payment")]:
              item.daily_payout,
            [text("daily_calculation_header_cumulative_payment")]:
              item.cumulative_payment,
            [text("withdrawal_information_header_payment_date")]:
              formatDateAndTime(item.payout_date, "YYYY-MM-DD", timezone),
          })),
        `${arrayToString([
          text("daily_calculation_excel_file_daily_calculation"),
          formatDate(new Date(), false, "YYYY-MM-DD"),
          currency,
        ])}`,
      );

      postAdminHistoryLog({
        content_en: "Excel Download",
        content_kr: "Excel Download",
        uuid: arrayToString([
          text("daily_calculation_excel_file_daily_calculation"),
          formatDate(new Date()) + ".xlsx",
        ]),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency],
  );

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: `${text("withdrawal_information_header_no")}`,
        maxWidth: 60,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("withdrawal_information_header_name"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "user_id",
        headerName: text("withdrawal_information_header_user_id"),
        minWidth: 200,
        renderCell: function ({ value }) {
          return (
            value && (
              <div className="flex w-full items-center justify-between">
                  <span className="w-fit truncate text-ellipsis">{value}</span>
                  <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
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
            )
          );
        },
      },
      {
        ...sharedColDef,
        field: "email",
        headerName: text("withdrawal_information_header_email"),
        minWidth: 250,
        filterable: !!showEmail,
        sortable: !!showEmail,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
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
        field: "daily_payout",
        headerName: text("withdrawal_information_header_daily_payment"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value, 3)}{" "}
            {currency === "KRW"
              ? text("deposit_information_krw_suffix")
              : currency}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "cumulative_payment",
        headerName: text("daily_calculation_header_cumulative_payment"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value, 3)}{" "}
            {currency === "KRW"
              ? text("deposit_information_krw_suffix")
              : currency}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "payout_date",
        headerName: text("withdrawal_information_header_payment_date"),
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) => (
          <span className="whitespace-normal w-fit ">
            <DateFormatter value={value} />
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, currency, showEmail],
  );

  const usersWithIndex = useMemo(() => {
    const users =
      data?.users?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [];
    return [...users];
  }, [data?.users, limit, page]);

  const handleDataFilterChange = useCallback((dataFilter: DataFilterType) => {
    setPage(1);
    setDataFilter(dataFilter);
  }, []);

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    resetSorting,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("dailyCalColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div ref={divRef} className="h-full overflow-y-auto px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("daily_calculation_information_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("daily_calculation_information_detail")}
        </span>
      </div>

      <Tabs
        className="flex"
        value={currency}
        onChange={(_, val) => {
          setCurrency(val);
          setPage(1);
          setLimit(25);
          resetSorting();
        }}
        aria-label="Currency Tabs"
      >
        <Tab
          value="KRW"
          label={text("deposit_information_krw_suffix")}
          className="rounded-l-lg flex-1 border border-neutral-200 border-solid"
          aria-label="krw-tab"
        />
        <Tab
          value="USDT"
          label="USDT"
          className="rounded-r-lg flex-1 border border-neutral-200 border-solid"
          aria-label="usdt-tab"
        />
      </Tabs>

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
          <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
          <button
            id={htmlIds.btn_daily_calculation_information_excel_download}
            disabled={isLoading || (data?.users || [])?.length <= 0}
            onClick={() => data?.users && handleExcelDownload(data?.users)}
            className="flex text-nowrap items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md  disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
          >
            <span>{text("withdrawal_information_excel_download")}</span>
          </button>
        </div>
      </div>

      <div className="w-full bg-white tableContainer">
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={usersWithIndex}
          columns={columns}
          loading={isLoading || isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          isRowSelectable={(row) => !row.row?.is_paid}
          autoHeight={!isLoading}
          paginationMode="server"
          rowCount={usersWithIndex.length}
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

export default DailyCalculationInformationPage;
