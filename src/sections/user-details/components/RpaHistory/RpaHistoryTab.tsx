import { customisedTableClasses } from "@common/constants/classes";
import { arrayToString } from "@common/utils/helpers";
import { Box, IconButton } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import {
  IUserRPAHistory,
  UserRPAHistoryDataFilter,
  useGetMassRpaHistory,
  useGetUserRpaHistory,
  usePostAdminHistoryLog,
} from "api/hooks";
import { useLocale } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useResponsive from "@common/hooks/useResponsive";
import {
  DataFilterWrapper,
  DateFormatter,
  FilterButton,
  Pagination,
  ShowEmail,
  Spinner,
} from "@common/components";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import {
  convertToHHMMSS,
  convertToYYYYMMDD,
  formatDate,
  formatDateAndTime,
} from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import { htmlIds } from "@cypress/utils/ids";
import { ExtraFilters } from "@sections/p2u-management";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

type Query = {
  tabIndex: string;
  email?: string;
  name?: string;
  phone_number?: string;
};

function RpaHistory() {
  const { isDesktop, isBigScreen } = useResponsive();
  const { text } = useLocale();
  const { timezone } = useTimezone();
  const [showEmail, setShowEmail] = useState(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const router = useRouter();
  const [dataFilter, setDataFilter] = useState<UserRPAHistoryDataFilter>();
  const [isAccumulated, setIsAccumulated] = useState<string>(
    (router.query.is_accumulated as string) || "all",
  );
  const [isAffiliated, setIsAffiliated] = useState<string>(
    (router.query.is_affiliated as string) || "all",
  );
  const [filterMobileDrawerOpen, setFilterMobileDrawerOpen] =
    useState<boolean>(false);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const { email } = router.query as Query;

  const { data, isLoading, isFetching } = useGetUserRpaHistory({
    email,
    limit,
    page,
    dateTo: dataFilter?.endDate,
    dateFrom: dataFilter?.startDate,
    searchKey: dataFilter?.searchKey,
    is_accumulated: dataFilter?.is_accumulated,
    is_affiliated: dataFilter?.is_affiliated,
    version: 2,
  });

  const { mutateAsync: getMassRpaHistory, isLoading: massDownloadLoading } =
    useGetMassRpaHistory();

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
        field: "id",
        headerName: text("user_rpa_history_header_id"),
        minWidth: 400,
        width: 200,
        renderCell: ({ value }) => (
          <div className="flex items-center">
            <span className="w-[380px] truncate text-ellipsis">{value}</span>
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
        field: "email",
        headerName: text("user_rpa_history_header_email"),
        minWidth: 210,
        renderCell: ({ value }) => (
          <div className="flex items-center">
            <span className="w-[200px] truncate text-ellipsis">
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
        field: "companyCode",
        headerName: text("user_rpa_history_header_companyCode"),
        minWidth: 120,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "amount",
        headerName: text("user_rpa_history_header_amount"),
        minWidth: 100,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "point",
        headerName: text("user_rpa_history_header_point"),
        minWidth: 100,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "isAccumulated",
        headerName: text("user_rpa_history_header_isAccumulated"),
        minWidth: 110,
        flex: 1,
        width: 100,
        renderCell: ({ value }) => {
          if (value === true) {
            return (
              <p className="text-green-400">
                {text("user_rpa_history_header_true")}
              </p>
            );
          } else {
            return (
              <p className="text-red-400">
                {text("user_rpa_history_header_false")}
              </p>
            );
          }
        },
      },
      {
        ...sharedColDef,
        field: "percentage",
        headerName: text("user_rpa_history_header_percentage"),
        minWidth: 100,
        width: 100,
        renderCell: ({ value }) => {
          return (
            <>
              <p>{value}%</p>
            </>
          );
        },
      },
      {
        ...sharedColDef,
        field: "threshold",
        headerName: text("user_rpa_history_header_threshold"),
        minWidth: 100,
        flex: 1,
        width: 100,
        renderCell: ({ value }) => {
          return (
            <div className="flex gap-1">
              <p>{value}</p>
              <p>Days</p>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "paymentStatus",
        headerName: text("user_rpa_history_header_paymentStatus"),
        minWidth: 120,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "approvalDate",
        headerName: text("user_rpa_history_header_approvalDate"),
        minWidth: 120,
        flex: 1,
        width: 120,
        renderCell: ({ row }) => {
          return (
            <div className="flex flex-col">
              <p className="truncate">
                <DateFormatter
                  value={convertToYYYYMMDD(row.approvalDate)}
                  format="YYYY-MM-DD"
                />{" "}
              </p>
              <p className="truncate">
                <DateFormatter
                  value={convertToHHMMSS(row.approvalTime)}
                  format="HH:mm:ss"
                />
              </p>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "cancelDate",
        headerName: text("user_rpa_history_header_cancelDate"),
        minWidth: 100,
        flex: 1,
        width: 100,
        renderCell: ({ value }) => (
          <div>
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD" />
            </p>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "installment",
        headerName: text("user_rpa_history_header_installment"),
        minWidth: 100,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "salesType",
        headerName: text("user_rpa_history_header_salesType"),
        minWidth: 100,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "currencyCode",
        headerName: text("user_rpa_history_header_currencyCode"),
        minWidth: 120,
        flex: 1,
        width: 120,
        renderCell: ({ value }) =>
          value ? (
            <div>
              <span>{value}</span>
            </div>
          ) : (
            "KRW"
          ),
      },
      {
        ...sharedColDef,
        field: "cardKind",
        headerName: text("user_rpa_history_header_cardKind"),
        minWidth: 150,
        flex: 1,
        width: 150,
      },
      {
        ...sharedColDef,
        field: "cardNumber",
        headerName: text("user_rpa_history_header_cardNumber"),
        minWidth: 150,
        flex: 1,
        width: 150,
      },
      {
        ...sharedColDef,
        field: "merchantKind",
        headerName: text("user_rpa_history_header_merchantKind"),
        minWidth: 120,
        flex: 1,
        width: 120,
      },
      {
        ...sharedColDef,
        field: "merchantName",
        headerName: text("user_rpa_history_header_merchantName"),
        minWidth: 150,
        flex: 1,
        width: 150,
      },
      {
        ...sharedColDef,
        field: "isAffiliated",
        headerName: text("user_rpa_history_header_isAffiliated"),
        minWidth: 120,
        flex: 1,
        width: 100,
        renderCell: ({ value }) => {
          if (value === true) {
            return (
              <p className="text-green-400">
                {text("user_rpa_history_header_true")}
              </p>
            );
          } else {
            return (
              <p className="text-red-400">
                {text("user_rpa_history_header_false")}
              </p>
            );
          }
        },
      },
      {
        ...sharedColDef,
        field: "merchantCode",
        headerName: text("user_rpa_history_header_merchantCode"),
        minWidth: 120,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "businessNumber",
        headerName: text("user_rpa_history_header_businessNumber"),
        minWidth: 140,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "merchantRepresentativeName",
        headerName: text("user_rpa_history_header_merchantRepresentativeName"),
        minWidth: 120,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "merchantAddress",
        headerName: text("user_rpa_history_header_merchantAddress"),
        minWidth: 150,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "merchantPhone",
        headerName: text("user_rpa_history_header_merchantPhone"),
        minWidth: 140,
        flex: 1,
        width: 100,
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("user_rpa_history_header_createdAt"),
        minWidth: 150,
        flex: 1,
        width: 120,
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ),
      },
    ],
    [text, showEmail, copyToClipboard],
  );

  const userRpaHistory =
    data?.getUserRPAHistory?.map((item) => ({ ...item })) || [];

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
  } = useGridColumnChange("rpaHistoryTabColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);
  /* DataGrid Columns Reorder & Sort Handling End */

  const handleExcelDownload = (rpaHistory: IUserRPAHistory[]) => {
    jsonToExcelDownload(
      rpaHistory?.map((item) => ({
        [text("user_rpa_history_header_id")]: item.id,
        [text("user_rpa_history_header_email")]: item.email,
        [text("user_rpa_history_header_companyCode")]:
          item.companyCode || "---",
        [text("user_rpa_history_header_amount")]: item.amount || "---",
        [text("user_rpa_history_header_point")]: item.point || "---",
        [text("user_rpa_history_header_isAccumulated")]:
          item.isAccumulated === true
            ? text("user_rpa_history_header_true")
            : text("user_rpa_history_header_false"),
        [text("user_rpa_history_header_percentage")]:
          (item.percentage || 0) + "%",
        [text("user_rpa_history_header_threshold")]:
          (item.threshold || 0) + " days" || "---",
        [text("user_rpa_history_header_paymentStatus")]:
          item.paymentStatus || "---",
        [text("user_rpa_history_header_approvalDate")]: item?.approvalDate
          ? formatDateAndTime(
              item.approvalDate,
              "YYYY-MM-DD HH:mm:ss",
              timezone,
            )
          : "",
        [text("user_rpa_history_header_cancelDate")]: item?.cancelDate
          ? formatDateAndTime(item.cancelDate, "YYYY-MM-DD HH:mm:ss", timezone)
          : "",
        [text("user_rpa_history_header_installment")]:
          item.installment || "---",
        [text("user_rpa_history_header_salesType")]: item.salesType || "---",
        [text("user_rpa_history_header_currencyCode")]:
          item.currencyCode || "---",
        [text("user_rpa_history_header_cardKind")]: item.cardKind || "---",
        [text("user_rpa_history_header_cardNumber")]: item.cardNumber || "---",
        [text("user_rpa_history_header_merchantKind")]:
          item.merchantKind || "---",
        [text("user_rpa_history_header_merchantName")]:
          item.merchantName || "---",
        [text("user_rpa_history_header_isAffiliated")]:
          item.isAffiliated === true
            ? text("user_rpa_history_header_true")
            : text("user_rpa_history_header_false"),
        [text("user_rpa_history_header_merchantCode")]:
          item.merchantCode || "---",
        [text("user_rpa_history_header_businessNumber")]:
          item.businessNumber || "---",
        [text("user_rpa_history_header_merchantRepresentativeName")]:
          item.merchantRepresentativeName || "---",
        [text("user_rpa_history_header_merchantAddress")]:
          item.merchantAddress || "---",
        [text("user_rpa_history_header_merchantPhone")]:
          item.merchantPhone || "---",
        [text("user_rpa_history_header_createdAt")]: item.createdAt
          ? formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone)
          : "",
      })),
      `${arrayToString([
        text("users_rpa_history"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([text("users_rpa_history"), formatDate(new Date())]) +
        ".xlsx",
    });
  };

  const handleDataFilterChange = useCallback(
    (_dataFilter: UserRPAHistoryDataFilter) => {
      setPage(1);
      setDataFilter(_dataFilter);
      if (router.isReady) {
        router.push({
          pathname: router.pathname,
          query: {
            ...Object.fromEntries(
              Object.entries({
                ...router.query,
                ..._dataFilter,
              }).filter(
                ([_, v]) =>
                  typeof v === "string" &&
                  v !== undefined &&
                  v !== null &&
                  v.length !== 0,
              ),
            ),
          },
        });
        setFirstLoaded(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.searchKey,
      router.query.startDate,
      router.query.endDate,
      router.query.is_affiliated,
      router.query.is_accumulated,
      router.isReady,
      firstLoaded,
    ],
  );

  return (
    <div>
      <div className={"flex flex-col gap-2  items-start my-4"}>
        <div className="w-full text-gray-400 text-2xl  text-grey">
          {text("user_rpa_history_title")}
        </div>
        {!isBigScreen && (
          <div className={"flex w-full justify-end"}>
            <FilterButton onClick={() => setFilterMobileDrawerOpen(true)} />
          </div>
        )}
        <div className="pt-3 border-t w-full">
          <DataFilterWrapper
            data={[
              {
                onChange: handleDataFilterChange,
              },
            ]}
            filterMobileDrawerOpen={filterMobileDrawerOpen}
            setFilterMobileDrawerOpen={setFilterMobileDrawerOpen}
          />
        </div>
        <div className="flex w-full gap-1 justify-between overflow-auto items-center pt-4 pb-4 md:pt-2 md:pb-0">
          <div className="flex gap-1">
            {Object.keys(columnCurrentState).length > 0 && (
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExtraFilters
              isAccumulated={isAccumulated}
              isAffiliated={isAffiliated}
              setIsAccumulated={setIsAccumulated}
              setIsAffiliated={setIsAffiliated}
              onChange={handleDataFilterChange}
            />
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            {isDesktop && (
              <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
            )}
            <button
              id={htmlIds.btn_users_excel_download}
              disabled={massDownloadLoading || !userRpaHistory.length}
              onClick={() => {
                getMassRpaHistory(
                  {
                    searchKey: dataFilter?.searchKey,
                    is_accumulated: dataFilter?.is_accumulated,
                    is_affiliated: dataFilter?.is_affiliated,
                    dateFrom: dataFilter?.startDate,
                    dateTo: dataFilter?.endDate,
                    version: 2,
                    email,
                  },
                  {
                    onSuccess: (_data) => {
                      _data?.getUserRPAHistory &&
                        handleExcelDownload(_data?.getUserRPAHistory);
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
      </div>
      <div className="w-full bg-white tableContainer pb-10">
        <DataGridPro
          rows={userRpaHistory || []}
          rowCount={userRpaHistory?.length || 0}
          getRowId={(row) => row.id}
          columns={columns}
          loading={isFetching || isLoading}
          autoHeight={!isFetching || !isLoading}
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
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default RpaHistory;
