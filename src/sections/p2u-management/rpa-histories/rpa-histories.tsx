import { customisedTableClasses } from "@common/constants/classes";
import { arrayToString } from "@common/utils/helpers";
import { Box, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import {
  IUserRPAHistory,
  UserRPAHistoryDataFilter,
  useGetCheckStoresRegistered,
  useGetMassRpaHistory,
  useGetUserRpaHistory,
  usePostAdminHistoryLog,
} from "api/hooks";
import { useLocale } from "locale";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import useResponsive from "@common/hooks/useResponsive";
import { PDRegisterAffiliate } from "@sections/platform/platform-details/components/PDRegisterAffiliate";
import { RegisterAffiliateRef } from "@sections/platform/platform-details/components/PDRegisterAffiliate/PDRegisterAffiliate";
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
  formatDateAndTime,
  formatDate,
} from "@common/utils/formatters";
import { useRouter } from "next/router";
import { htmlIds } from "@cypress/utils/ids";
import { useTimezone } from "@common/hooks";
import ExtraFilters from "./components/ExtraFilters/ExtraFilters";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

function UsersRpaHistories() {
  const { isBigScreen } = useResponsive();
  const { text } = useLocale();
  const [showEmail, setShowEmail] = useState(false);
  const [storeMode, setStoreMode] = useState(false);
  const [storeCreateInitialValues, setStoreCreateInitialValues] =
    useState<IUserRPAHistory | null>(null);
  const [
    selectedRPAHistoryToRegisterStore,
    setSelectedRPAHistoryToRegisterStore,
  ] = useState<string>("");
  const [storesAlreadyAvailable, setStoresAlreadyAvailable] = useState<
    string[]
  >([]);
  const [filterMobileDrawerOpen, setFilterMobileDrawerOpen] =
    useState<boolean>(false);
  const { timezone } = useTimezone();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const router = useRouter();
  // const dataFilter: UserRPAHistoryDataFilter = router.query;
  const pdRegisterAffiliateRef = useRef<RegisterAffiliateRef>(null);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [isAccumulated, setIsAccumulated] = useState<string>(
    (router.query.is_accumulated as string) || "all",
  );
  const [isAffiliated, setIsAffiliated] = useState<string>(
    (router.query.is_affiliated as string) || "all",
  );
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const [dataFilter, setDataFilter] = useState<UserRPAHistoryDataFilter>();
  const [firstLoaded, setFirstLoaded] = useState(false);
  const { data, isLoading, isFetching } = useGetUserRpaHistory({
    email: "",
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

  const {
    mutateAsync: checkStoresRegisteredApi,
    isLoading: checkStoreRegisteredLoading,
  } = useGetCheckStoresRegistered();

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
        field: "store",
        headerName: text("user_rpa_history_header_store"),
        hide: !storeMode,
        filterable: false,
        sortable: false,
        width: 50,
        renderCell: ({ row }) => {
          const loading =
            checkStoreRegisteredLoading &&
            selectedRPAHistoryToRegisterStore === row.id + row.email;
          const isStoreAlreadyAvailable = storesAlreadyAvailable.includes(
            row.businessNumber,
          );
          return (
            <button
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md bg-blue-500 ${loading || isStoreAlreadyAvailable
                  ? "disabled:opacity-50 disabled:bg-gray-400"
                  : ""
                }`}
              disabled={loading || isStoreAlreadyAvailable}
              onClick={() => handleOpenStoreCreateDialog(row)}
            >
              {loading ? <Spinner /> : text("user_rpa_history_add_store_btn")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "id",
        headerName: text("user_rpa_history_header_id"),
        minWidth: 400,
        width: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
            <span className="w-[380px] truncate">{value}</span>
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
        minWidth: 250,
        renderCell: ({ value }) => {
          return (
            <div className="w-full flex items-center justify-between">
              <span className="w-[200px] truncate">
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
          );
        },
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
        type: "number",
      },
      {
        ...sharedColDef,
        field: "point",
        headerName: text("user_rpa_history_header_point"),
        minWidth: 100,
        flex: 1,
        width: 100,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "isAccumulated",
        headerName: text("user_rpa_history_header_isAccumulated"),
        minWidth: 110,
        flex: 1,
        width: 100,
        type: "boolean",
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
        type: "number",
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
        type: "number",
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
        renderCell: ({ value }) => <p className={value === "PAID" ? "text-green-400" : "text-red-400"}>{value}</p>,
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
        type: "date",
        renderCell: ({ row }) => {
          return (
            <div
              key={"approvalDate" + row.id}
              className="flex flex-col whitespace-normal gap-2 w-full"
            >
              <DateFormatter
                value={convertToYYYYMMDD(row.approvalDate)}
                format="YYYY-MM-DD"
              />{" "}
              &nbsp;
              <DateFormatter
                value={convertToHHMMSS(row.approvalTime)}
                format="HH:mm:ss"
              />
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
        type: "date",
        renderCell: ({ value }) => (
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} showTime={false} />
            </span>
          ) : (
            "---"
          )
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
        minWidth: 150,
        flex: 1,
        width: 150,
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
        type: "boolean",
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
        renderCell: ({ value }) =>
          value ? (
            <div>
              <span>{value}</span>
            </div>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "merchantRepresentativeName",
        headerName: text("user_rpa_history_header_merchantRepresentativeName"),
        minWidth: 120,
        flex: 1,
        width: 100,
        renderCell: ({ value }) =>
          value ? (
            <div>
              <span>{value}</span>
            </div>
          ) : (
            "---"
          ),
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
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      text,
      showEmail,
      storeMode,
      checkStoreRegisteredLoading,
      selectedRPAHistoryToRegisterStore,
      storesAlreadyAvailable,
    ],
  );

  const userRpaHistory =
    data?.getUserRPAHistory?.map((item) => ({ ...item })) || [];

  const handleOpenStoreCreateDialog = useCallback(
    async (initialValues: IUserRPAHistory) => {
      if (!initialValues.businessNumber) {
        toast.error(text("affiliate_register_store_no_business_number"));
        setStoresAlreadyAvailable((prev) => [
          ...prev,
          initialValues.businessNumber,
        ]);
        return;
      }
      setSelectedRPAHistoryToRegisterStore(
        initialValues.id + initialValues.email,
      );
      const checkStoreResponse = await checkStoresRegisteredApi({
        code: initialValues.businessNumber,
      }).catch((err) => {
        setSelectedRPAHistoryToRegisterStore("");
        toast.error(err?.response?.data?.message);
      });
      if (checkStoreResponse?.message === "success") {
        toast.error(text("affiliate_register_store_already_exists"));
        setSelectedRPAHistoryToRegisterStore("");
        setStoresAlreadyAvailable((prev) => [
          ...prev,
          initialValues.businessNumber,
        ]);
        return;
      }
      pdRegisterAffiliateRef?.current?.openRegisterStore();
      setStoreCreateInitialValues(initialValues);
      setSelectedRPAHistoryToRegisterStore("");
    },
    [checkStoresRegisteredApi, text],
  );

  const handleOnCloseRegisterStore = useCallback(() => {
    setStoreCreateInitialValues(null);
  }, []);

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("rpaHistoriesColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail, storeMode]);

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

  return (
    <div className=" px-5 py-5">
      <div className="w-full pb-5 platforms-header mb-1 md:mb-2">
        <h4 className="text-2xl font-medium">
          {text("user_rpa_history_tab_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("users_rpa_histories_detail")}
        </span>
      </div>
      <div className="w-full flex gap-3 justify-between items-center mr-0 py-4 md:py-1">
        <div className="flex gap-3 py-2 w-screen h-28 overflow-x-auto">
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 mb-4 rounded-lg h-24 w-56 border border-slate-300 px-4 py-3 flex-shrink-0 shadow-md">
              <span className="text-gray-400 font-medium text-sm popinText">
                {text("user_card_created_queue_count")}
              </span>
              <div className="flex gap-2">
                <span className="flex items-center font-medium text-sm mt-1">
                  {isLoading ? (
                    <Spinner size={6} />
                  ) : (
                    <>
                      {text("user_card_created_history")}: {data?.numberOfQueue}{" "}
                      | {text("user_card_created_card")}:{" "}
                      {data?.numberOfCardQueue}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
              <span className="text-gray-400 font-medium text-sm popinText">
                {text("user_card_created_in_flight_count")}
              </span>
              <span className="flex items-center font-medium text-sm mt-1">
                {isLoading ? (
                  <Spinner size={6} />
                ) : (
                  <>
                    {text("user_card_created_history")}: {data?.numberOfFlight}{" "}
                    | {text("user_card_created_card")}:{" "}
                    {data?.numberOfCardFlight}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
              <span className="text-gray-400 font-medium text-sm popinText">
                {text("user_card_created_last_rpa_call_time")}
              </span>
              <span className="font-medium text-sm mt-1">
                {isLoading ? (
                  <Spinner size={6} />
                ) : data?.lastRPACallTime ? (
                  <DateFormatter value={data?.lastRPACallTime} showZone />
                ) : (
                  "---"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {!isBigScreen && (
        <div className={"flex justify-end"}>
          <FilterButton onClick={() => setFilterMobileDrawerOpen(true)} />
        </div>
      )}
      <div className="pt-2">
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
      <div className="flex justify-between overflow-auto">
        <div className="flex items-center flex-nowrap gap-y-1 ">
          <FormControlLabel
            control={
              <Checkbox
                checked={storeMode}
                onChange={() => setStoreMode((prev) => !prev)}
              />
            }
            label={text("checkbox_add_store_mode_label")}
          />

          {Object.keys(columnCurrentState).length > 0 && (
            <div className="flex items-center flex-wrap gap-y-4 justify-start">
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          )}
        </div>
        <div className="flex py-2 items-center">
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
          <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
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
      <div
        className="w-full bg-white tableContainer"
        id={htmlIds.div_users_table_container}
      >
        <DataGridPro
          rows={userRpaHistory || []}
          rowCount={userRpaHistory?.length || 0}
          getRowId={(row) => row.id + row.email}
          columns={columns}
          loading={isFetching || isLoading}
          disableSelectionOnClick
          paginationMode="server"
          sx={customisedTableClasses}
          hideFooter
          autoHeight={!isLoading || !isFetching}
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
      <PDRegisterAffiliate
        ref={pdRegisterAffiliateRef}
        platformName={""}
        setSelectedItem={() => { }}
        selectedItem={null}
        currentAffiliateTab={0}
        onCloseRegisterStore={() => handleOnCloseRegisterStore()}
        registerStoreInitialData={{
          name: storeCreateInitialValues?.merchantName,
          code: storeCreateInitialValues?.businessNumber,
          store_details: storeCreateInitialValues?.merchantKind,
          address_suggestion: storeCreateInitialValues?.merchantAddress,
        }}
        showAllCategories
        externalRegisterMode
      />
    </div>
  );
}

export default UsersRpaHistories;
