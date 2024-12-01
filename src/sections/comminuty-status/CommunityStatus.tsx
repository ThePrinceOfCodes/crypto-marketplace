/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataFilterType, DateFormatter, Spinner } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { GridColDef, GridEventListener } from "@mui/x-data-grid";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { htmlIds } from "@cypress/utils/ids";
import _debounce from "lodash/debounce";
import {
  showSortingPageNotification,
  resetMUIToolbarFilter,
  arrayToString,
  scrollToTop,
} from "@common/utils/helpers";
import dynamic from "next/dynamic";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import {
  useGetCommunityStatus,
  useGetMassCommunityStatus,
  useRefreshCronJob,
} from "api/hooks/community-status";
import { ICommunityStatus } from "api/hooks/community-status/types";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import {
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import { formatDate } from "@cypress/utils/converters";
import { usePostAdminHistoryLog } from "api/hooks";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { Box, Breadcrumbs, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import { MuiLink } from "@common/components/MuiLink";
import Image from "next/image";
import dayjs from "dayjs";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function CommunityStatus() {
  const { locale, text } = useLocale();
  const { timezone } = useTimezone();
  const [lastId, setLastId] = useState<string>();
  const [lastCreatedAt, setLastCreatedAt] = useState<number>();
  const [communityStatus, setCommunityStatus] = useState<ICommunityStatus[]>(
    [],
  );
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  // Added start
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;

  // Added end
  const { data, isFetching, refetch } = useGetCommunityStatus(
    {
      limit: 25,
      lastId,
      createdAt: lastCreatedAt,
      searchKey:
        (dataFilter?.searchKey?.length || 0) > 0
          ? dataFilter?.searchKey
          : undefined,
      date_from: dataFilter?.startDate,
      date_to: dataFilter?.endDate,
    },
    {
      onSuccess: (data) => {
        if (lastId !== undefined) {
            setCommunityStatus((prev) => [...prev, ...data.data]);
          } else {
            setCommunityStatus(data.data);
          }
      },
    },
  );
  const { mutateAsync: getMassCommunityStatus, isLoading: massDownloadLoading } = useGetMassCommunityStatus();
  const { mutateAsync: refreshCronJob, isLoading: isRefreshingCronJob } = useRefreshCronJob();
  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("community_status_page_column_no"),
        minWidth: 80,
      },
      {
        ...sharedColDef,
        field: "country",
        headerName: text("community_status_page_column_country"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("community_status_page_column_community_name"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "execution_date",
        headerName: text("community_status_page_column_execution_date"),
        minWidth: 160,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            <p className="truncate">---</p>
          ),
      },
      {
        ...sharedColDef,
        field: "last_month_total_members",
        headerName: text(
          "community_status_page_column_last_month_total_member",
        ),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "last_month_new_members",
        headerName: text("community_status_page_column_last_month_new_member"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "this_month_new_members",
        headerName: text("community_status_page_column_this_month_new_member"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "this_month_growth_rate",
        headerName: text("community_status_page_column_this_month_growth_rate"),
        minWidth: 150,
        renderCell: ({ value }) => {
          if (value < 0) {
            return <span className="text-blue-500">{`${value}%`}</span>;
          } else {
            return <span className="text-red-500">{`${value}%`}</span>;
          }
        },
      },
      {
        ...sharedColDef,
        field: "total_member_growth_rate",
        headerName: text(
          "community_status_page_column_total_members_growth_rate",
        ),
        minWidth: 150,
        renderCell: ({ value }) => {
          if (value < 0) {
            return <span className="text-blue-500">{`${value}%`}</span>;
          } else {
            return <span className="text-red-500">{`${value}%`}</span>;
          }
        },
      },
      {
        ...sharedColDef,
        field: "total_members",
        headerName: text("community_status_page_column_total_members"),
        minWidth: 150,
        renderCell: ({ value, row }) => {
          return (
            <Tooltip title={value} arrow placement="top">
              <Link
                href={`/users?super_save_community=${row?.name}`}
                target="_blank"
                className="flex w-full"
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
        field: "last_month_participation_amount",
        headerName: text(
          "community_status_page_column_last_month_participation_amount",
        ),
        minWidth: 150,
        renderCell: ({ value, row }) => {
          const text = "Last Month Participation Amount";
          const startDate = dayjs(row?.execution_date).subtract(1, "month").startOf("month").format("YYYY-MM-DD");
          const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
          return (
             <Tooltip title={text} arrow placement="top">
              <Link
                href={`/super-save/deposit-information?community=${row?.name}&action_date=${startDate}&action_date=${endDate}&status=1&credit_sale_permission=super_save`}
                target="_blank"
                className="flex w-full"
              >
                <span className="truncate w-fit">{formatNumberWithCommas(value)} KRW</span>
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
        field: "this_month_participation_amount",
        headerName: text(
          "community_status_page_column_this_month_participation_amount",
        ),
        minWidth: 150,
        renderCell: ({ value, row }) => {
          const text = "This Month Participation Amount";
          const startDate = dayjs(row?.execution_date).format("YYYY-MM-DD");
          const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
          return (
             <Tooltip title={text} arrow placement="top">
              <Link
                href={`/super-save/deposit-information?community=${row?.name}&action_date=${startDate}&action_date=${endDate}&status=1&credit_sale_permission=super_save`}
                target="_blank"
                className="flex w-full"
              >
                <span className="truncate w-fit">{formatNumberWithCommas(value)} KRW</span>
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
        field: "this_month_cash_participation_amount",
        headerName: text(
          "community_status_page_column_this_month_cash_participation_amount",
        ),
        minWidth: 150,
        renderCell: ({ value }) => {
          return <span className="">{formatNumberWithCommas(value)} KRW</span>;
        },
      },
      {
        ...sharedColDef,
        field: "this_month_participant_growth_rate",
        headerName: text(
          "community_status_page_column_this_month_participation_growth_rate",
        ),
        minWidth: 150,
        renderCell: ({ value }) => {
          if (value < 0) {
            return <span className="text-blue-500">{`${value}%`}</span>;
          } else {
            return <span className="text-red-500">{`${value}%`}</span>;
          }
        },
      },
      {
        ...sharedColDef,
        field: "created_by",
        headerName: text("community_status_page_created_by"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("community_status_page_created_date"),
        minWidth: 160,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            <p className="truncate">---</p>
          ),
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("community_status_page_last_modified_by"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "action_date",
        headerName: text("community_status_page_last_modified_date"),
        minWidth: 160,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            <p className="truncate">---</p>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (communityStatus?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
      setLastCreatedAt(data?.lastCreatedAt);
    }
  }, [communityStatus?.length, data?.hasNext, data?.lastCreatedAt, data?.lastId]);

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
  }, []);

  const newsWithIndex = useMemo(
    () =>
      communityStatus.map((item, index) => ({
        ...item,
        this_month_cash_participation_amount:
          item.this_month_participation_amount / 2,
        no: index + 1,
      })),
    [communityStatus],
  );

  const {
    handleColumnChange,
    handleSaveView,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    setOpenConfirmDialog,
    columnCurrentState,
    handleResetDefault,
  } = useGridColumnChange("communityStateColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  const handleExcelDownload = (rows: ICommunityStatus[]) => {
    jsonToExcelDownload(
      rows?.map((row, index) => ({
        [text("community_status_page_column_no")]: index + 1,
        [text("community_status_page_column_country")]: row.country,
        [text("community_status_page_column_community_name")]: row.name,
        [text("community_status_page_column_execution_date")]:
          row.execution_date
            ? formatDateAndTime(
                row.execution_date,
                "YYYY-MM-DD HH:mm:ss",
                timezone,
              )
            : "---",
        [text("community_status_page_column_last_month_total_member")]:
          row.last_month_total_members,
        [text("community_status_page_column_last_month_new_member")]:
          row.last_month_new_members,
        [text("community_status_page_column_this_month_new_member")]:
          row.this_month_new_members,
        [text(
          "community_status_page_column_this_month_growth_rate",
        )]: `${row.this_month_growth_rate}%`,
        [text(
          "community_status_page_column_total_members_growth_rate",
        )]: `${row.total_member_growth_rate}%`,
        [text("community_status_page_column_total_members")]: row.total_members,
        [text(
          "community_status_page_column_last_month_participation_amount",
        )]: `${formatNumberWithCommas(
          row.last_month_participation_amount,
        )} KRW`,
        [text(
          "community_status_page_column_this_month_participation_amount",
        )]: `${formatNumberWithCommas(
          row.this_month_participation_amount,
        )} KRW`,
        [text(
          "community_status_page_column_this_month_cash_participation_amount",
        )]: `${formatNumberWithCommas(
          row.this_month_participation_amount / 2,
        )} KRW`,
        [text(
          "community_status_page_column_this_month_participation_growth_rate",
        )]: `${row.this_month_participant_growth_rate}%`,
        [text("community_status_page_created_by")]: row.created_by,
        [text("community_status_page_created_date")]: row.createdAt
          ? formatDateAndTime(
            row.createdAt,
            "YYYY-MM-DD HH:mm:ss",
            timezone,
          )
          : "---",
        [text("community_status_page_last_modified_by")]: row.action_by,
        [text("community_status_page_last_modified_date")]: row.action_date
          ? formatDateAndTime(row.action_date, "YYYY-MM-DD HH:mm:ss", timezone)
          : "---",
      })),

      `${arrayToString([
        text("community_status_file_name"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("community_status_file_name"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <Breadcrumbs aria-label="breadcrumb" className="w-full" sx={{ mb: 3 }}>
        <Link href="/users" className="text-xs text-inherit hover:underline" passHref>
          {text("users_detail_link_users")}
        </Link>
        <MuiLink
          underline="hover"
          className="text-blue-500 text-xs"
          aria-current="page"
        >
          {text("community_status_page_title")}
        </MuiLink>
      </Breadcrumbs>

      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("community_status_page_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("community_status_page_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex gap-1 justify-between items-center py-4 md:py-3 flex-wrap">
        <div className="flex items-center flex-wrap">
          <div className="flex gap-2 flex-row ">
            <button
              className="flex items-center justify-center text-sm px-4  py-2.5 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
              onClick={() => {
                refreshCronJob(
                  {},
                  {
                    onSuccess: (_data) => {
                      _data.result && setLastId(undefined);
                      scrollToTop();
                      lastId === undefined && refetch();
                    },
                  },
                );
              }}
            >
              <Box display="flex" alignItems="center">
                {isRefreshingCronJob ? <Spinner size={5} /> : <RefreshIcon />}
                {text("refresh")}
              </Box>
            </button>
            <span className="flex items-center justify-center text-sm">
              {`Last : ${
                communityStatus[0]?.action_date
                  ? formatDateAndTime(
                      communityStatus[0]?.action_date,
                      "YYYY-MM-DD HH:mm:ss",
                      timezone,
                    )
                  : "---"
              } `}
            </span>
          </div>
        </div>
        <div className="flex">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <button
            id={htmlIds.btn_users_inquiry_excel_download}
            disabled={massDownloadLoading || !data?.data?.length}
            onClick={() => {
              getMassCommunityStatus(
                {
                  limit: newsWithIndex?.length,
                  searchKey:
                    (dataFilter?.searchKey?.length || 0) > 0
                      ? dataFilter?.searchKey
                      : undefined,
                  date_from: dataFilter?.startDate,
                  date_to: dataFilter?.endDate,
                },
                {
                  onSuccess: (_data) => {
                    _data.data && handleExcelDownload(_data?.data);
                  },
                },
              );
            }}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {massDownloadLoading && <Spinner />}
            <span>{text("users_inquiry_excel_download_title")}</span>
          </button>
        </div>
      </div>
      <div className="flex my-2">
        {Object.keys(columnCurrentState).length > 0 && (
          <SaveNResetButtons
            saveHandler={() => setOpenConfirmDialog(true)}
            resetHandler={handleResetDefault}
          />
        )}
      </div>
      <div
        id={htmlIds.community_status_report_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.uuid}
          rows={newsWithIndex}
          columns={columns}
          paginationMode="server"
          loading={isFetching}
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

export default CommunityStatus;
