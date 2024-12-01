import { customisedTableClasses } from "@common/constants/classes";
import {
  arrayToString,
  showSortingPageNotification,
} from "@common/utils/helpers";
import { Box, IconButton } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import {
  ICardCompanies,
  IUserRPAError,
  useGetMassRpaErrorLogs,
  useGetUserRpaErrorLogs,
  usePostAdminHistoryLog,
} from "api/hooks";
import { useLocale } from "locale";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useResponsive from "@common/hooks/useResponsive";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  DataFilterType,
  DataFilterWrapper,
  DateFormatter,
  FilterButton,
  Pagination,
  ShowEmail,
  Spinner,
} from "@common/components";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomCellWithExpandable } from "@common/components/CustomCellWithExpandable";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { useRouter } from "next/router";
import { htmlIds } from "@cypress/utils/ids";
import { formatDate } from "@cypress/utils/converters";
import { formatDateAndTime } from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

function RpaErrorLogs() {
  const { isBigScreen } = useResponsive();
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const { timezone } = useTimezone();
  const [selectedItem, setSelectedItem] = useState<ICardCompanies | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [filterMobileDrawerOpen, setFilterMobileDrawerOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { mutateAsync: getMassRpaErrorLogs, isLoading: massDownloadLoading } =
    useGetMassRpaErrorLogs();
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const { data, isLoading, isFetching } = useGetUserRpaErrorLogs({
    page,
    limit,
    dateTo: dataFilter?.endDate,
    dateFrom: dataFilter?.startDate,
    searchKey: dataFilter?.searchKey,
    version: 2,
  });

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const handleOpenDialog = (item: ICardCompanies) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setOpen(false);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "email",
        headerName: text("users_rpa_error_logs_email"),
        minWidth: 200,
        renderCell: ({ value }) => {
          return (
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
          );
        },
      },

      {
        ...sharedColDef,
        field: "companyCode",
        headerName: text("users_rpa_error_logs_company_code"),
        minWidth: 150,
        flex: 1,
      },
      {
        ...sharedColDef,
        field: "errorCode",
        headerName: text("users_rpa_error_logs_error_code"),
        minWidth: 150,
        flex: 1,
      },
      {
        ...sharedColDef,
        field: "errorMessage",
        headerName: text("users_rpa_error_logs_errorMessage"),
        minWidth: 350,
        flex: 1,
        renderCell: ({ value }) => (
          <div className="w-full flex">
            <CustomCellWithExpandable text={value} textLimit={25} />
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("users_rpa_error_logs_createdAt"),
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
    [text, showEmail],
  );

  const userRPAErrorLog =
    data?.getUserRPAError?.map((item) => ({ ...item })) || [];

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("rpaErrorLogsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);

  const handleDataFilterChange = useCallback(
    (_dataFilter: DataFilterType) => {
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      router.isReady,
      firstLoaded,
    ],
  );

  const handleExcelDownload = (rpaHistory: IUserRPAError[]) => {
    jsonToExcelDownload(
      rpaHistory?.map((item) => ({
        [text("users_rpa_error_logs_email")]: item.email,
        [text("users_rpa_error_logs_company_code")]: item.companyCode || "---",
        [text("users_rpa_error_logs_error_code")]: item.errorCode || "---",
        [text("users_rpa_error_logs_errorMessage")]: item.errorMessage || "---",
        [text("users_rpa_error_logs_createdAt")]: item?.createdAt
          ? formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone)
          : "",
      })),
      `${arrayToString([
        text("users_rpa_error_logs_tab_title"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([
          text("users_rpa_error_logs_tab_title"),
          formatDate(new Date()),
        ]) + ".xlsx",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5">
      <div className="w-full pb-5 platforms-header mb-1 md:mb-2">
        <h4 className="text-2xl font-medium">
          {text("users_rpa_error_logs_tab_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("users_rpa_error_logs_detail")}
        </span>
      </div>

      <div className="w-full flex gap-1 items-center mr-0 py-4 md:py-1">
        <div
          className={`flex ${isLoading
            ? "items-center justify-center"
            : "gap-3 py-2 overflow-x-auto"
            } w-full h-36`}
        >
          {isLoading ? (
            <Spinner size={8} />
          ) : (
            data?.getCardCompanies
              ?.filter((item) => item.activated === true)
              .map((item, index) => (
                <div key={index} className="flex-shrink-0">
                  <div className="flex flex-col  justify-between rounded-lg h-auto w-58 border border-slate-300 px-4 py-3 flex-shrink-0">
                    <span className="text-gray-400 font-medium text-sm popinText">
                      {item?.code}
                    </span>
                    <div>
                      <div className="flex gap-2">
                        {item?.errorCode === "00000000" ? (
                          <span className="flex items-center gap-1 py-2 font-medium text-xs text-green-500">
                            {text("users_rpa_error_logs_service_up")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium text-xs text-red-500">
                            {text("users_rpa_error_logs_service_down")}
                            <IconButton onClick={() => handleOpenDialog(item)}>
                              <InformationCircleIcon className="h-6 w-6 text-gray-400 cursor-pointer" />
                            </IconButton>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] mt-[-0.5em]">
                        {" "}
                        <span className="text-2xs font-medium">
                          {" "}
                          {text("users_rpa_error_logs_last_updated")}{" "}
                        </span>{" "}
                        {
                          <DateFormatter
                            value={item.updatedAt}
                            breakLine={false}
                          />
                        }{" "}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      {!isBigScreen && (
        <div className={"flex mt-2 justify-end"}>
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
          isUserScreen={false}
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between md:items-center w-full my-3">
        <div className="flex gap-2">
          {Object.keys(columnCurrentState).length > 0 && (
            <div className="">
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-self-end items-center">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />

          <button
            id={htmlIds.btn_users_excel_download}
            disabled={massDownloadLoading || !userRPAErrorLog?.length}
            onClick={() => {
              getMassRpaErrorLogs(
                {
                  searchKey: dataFilter?.searchKey,
                  dateFrom: dataFilter?.startDate,
                  dateTo: dataFilter?.endDate,
                  version: 2,
                },
                {
                  onSuccess: (_data) => {
                    _data?.getUserRPAError &&
                      handleExcelDownload(_data?.getUserRPAError);
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
      <CustomDialog
        open={open}
        onClose={handleCloseDialog}
        titleText={text("users_rpa_error_logs_popup")}
        maxWidth="sm"
        fullWidth={false}
      >
        {/* Dialog content goes here */}
        {selectedItem && (
          <>
            <div className="min-[538px]:w-[450px] pb-4">
              <div className="flex flex-row justify-between py-6 bg-slate-100 px-4 my-4">
                <span className="text-sm font-bold">
                  {text("users_rpa_error_logs_error_code")}
                </span>
                <span className="text-sm">{selectedItem?.errorCode}</span>
              </div>
              <div className="flex flex-row justify-between py-6 bg-slate-100 px-4 my-4">
                <span className="text-sm font-bold w-[300px]">
                  {text("users_rpa_error_logs_errorMessage")}
                </span>
                <span className="text-sm w-[300px]">
                  {selectedItem?.errorMessage}
                </span>
              </div>
              <div className="flex flex-row max-[340px]:flex-col justify-between py-6 bg-slate-100 px-4 my-4">
                <span className="text-sm font-bold">
                  {text("users_rpa_error_logs_createdAt")}
                </span>
                <span className="text-sm">
                  <DateFormatter value={selectedItem?.updatedAt} showZone />
                </span>
              </div>
            </div>
            <Box sx={{ display: "flex", justifyContent: "center", columnGap: 2 }}>
              <FormFooter
                showCancelButton={false}
                onSubmit={handleCloseDialog}
                submitText={text("users_rpa_error_logs_popup_close")}
                sx={{ width: "144px" }}
              />
            </Box>
          </>
        )}
      </CustomDialog>

      <div className="w-full bg-white flex-grow tableContainer">
        <DataGridPro
          rows={userRPAErrorLog || []}
          rowCount={userRPAErrorLog?.length || 0}
          getRowId={(row) => `${row?.email}_${row?.createdAt}`}
          columns={columns}
          loading={isFetching || isLoading}
          disableSelectionOnClick
          paginationMode="server"
          sx={customisedTableClasses}
          autoHeight={!isFetching || !isLoading}
          hideFooter
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={(e) => {
            if (e && e.length > 0) {
              showSortingPageNotification(text("toast_warning_sorting_page"));
            }
            handleColumnChange();
          }}
          getRowHeight={() => "auto"}
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

export default RpaErrorLogs;
