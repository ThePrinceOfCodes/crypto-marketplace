import {
  DataFilterType,
  Pagination,
  DateFormatter,
  Spinner,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { formatDate, formatDateAndTime } from "@common/utils/formatters";
import { htmlIds } from "@cypress/utils/ids";
import { Divider, Tab, Tabs } from "@mui/material";
import { ServerLocalTypes, useLocale } from "locale";
import {
  useCopyToClipboard,
  arrayToString,
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import { DataGridPro, GridRowParams, GridColDef, GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from "@mui/x-data-grid-pro";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useGetAdminLogActivity,
  IGetAdminLogActivityUsers,
  usePostAdminHistoryLog,
  useGetMassAdminLogActivity,
} from "api/hooks";
import Image from "next/image";
import { useTimezone } from "@common/hooks";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomCellWithExpandable } from "@common/components/CustomCellWithExpandable";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import DetailPanel from "./HistoryDataLogs";
import CustomDetailPanelToggle from "./CustomDetailPanelToggle";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function AdminHistoryPage() {
  const copyToClipboard = useCopyToClipboard();
  const divRef = useRef<HTMLDivElement>(null);
  const { locale, text } = useLocale();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [type, setType] = useState<"default" | "access" | "excel">("default");
  const { timezone } = useTimezone();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const { isFetching, data } = useGetAdminLogActivity({
    limit,
    page,
    type: type === "default" ? undefined : type,
    searchKey:
      (dataFilter?.searchKey?.length || 0) > 0
        ? dataFilter?.searchKey
        : undefined,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
  });

  const {
    mutateAsync: getMassAdminLogActivity,
    isLoading: massDownloadLoading,
  } = useGetMassAdminLogActivity();

  const handleExcelDownload = (dataToDownload: IGetAdminLogActivityUsers[]) => {
    jsonToExcelDownload(
      dataToDownload?.map((item, index) => ({
        [text("withdrawal_information_header_no")]: index + 1,
        [text("super_save_admin_history_header_content")]: item.content,
        [text("super_save_admin_history_header_uuid")]: item.uuid,
        [text("super_save_admin_history_header_manager")]: item.action_by,
        [text("super_save_admin_history_header_ip_address")]: item?.ip_address
          ?.length
          ? item.ip_address
          : "---",
        [text("super_save_admin_history_header_date")]: formatDateAndTime(
          item.createdAt,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
      })),
      arrayToString([text("admin_history_title"), formatDate(new Date())]),
    );
    //
    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("admin_history_title"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  const columns: GridColDef[] = useMemo(
    () => {
      const cols: GridColDef[] = [
        {
          ...sharedColDef,
          field: "no",
          headerName: `${text("super_save_admin_history_header_no")}`,
          maxWidth: 60,
          disableReorder: true,
        },
        {
          ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
          renderCell: (params) => (
            <CustomDetailPanelToggle id={params.id} value={params.value} />
          ),
        },
        {
          ...sharedColDef,
          field: "content",
          headerName: text(
            type !== "default"
              ? "user_details_bank_details_tab_action"
              : "super_save_admin_history_header_content",
          ),
          minWidth: type !== "default" ? 300 : 550,
          flex: 1,
          renderCell: ({ value }) => {
            try {
              const parsedValue = JSON.parse(value)[ServerLocalTypes[locale]];
              return (
                <span>
                  <CustomCellWithExpandable text={parsedValue} textLimit={70} />
                </span>
              );
            } catch (e) {
              return (
                <span>
                  <CustomCellWithExpandable text={value} textLimit={70} />
                </span>
              );
            }
          },
        },
        {
          ...sharedColDef,
          field: "uuid",
          headerName: text("super_save_admin_history_header_uuid"),
          minWidth: 250,
          flex: 1,

          renderCell: ({ value }) =>
            value ? (
              <div className="flex w-full items-center justify-between">
                <span className="w-fit truncate text-ellipsis">{value}</span>
                <Image
                  className="cursor-pointer"
                  alt=""
                  width={17}
                  height={17}
                  src="/images/copy-icon.svg"
                  onClick={() => copyToClipboard(value)}
                />
              </div>
            ) : (
              "---"
            ),
        },
        {
          ...sharedColDef,
          field: "action_by",
          headerName: text("super_save_admin_history_header_manager"),
          minWidth: 100,
        },
        {
          ...sharedColDef,
          field: "ip_address",
          headerName: text("super_save_admin_history_header_ip_address"),
          minWidth: 250,
          flex: 1,
          renderCell: ({ value }) =>
            value ? (
              <div className="flex w-full items-center justify-between">
                <span className="w-fit truncate text-ellipsis">
                  {value}
                </span>
                <Image
                  className="cursor-pointer"
                  alt=""
                  width={17}
                  height={17}
                  src="/images/copy-icon.svg"
                  onClick={() => copyToClipboard(value)}
                />
              </div >)
              : (
                "---"
              )
        },
        {
          ...sharedColDef,
          field: "createdAt",
          headerName: text("super_save_admin_history_header_date"),
          type: "date",
          minWidth: 120,
          renderCell: ({ value }) =>
            value && (
              <span className="whitespace-normal w-fit ">
                <DateFormatter value={value} />
              </span>
            ),
        },
      ];

      if (type === "access") {
        return cols.filter((item) => item.field !== "uuid");
      }

      return cols;
    },
    // remove uuid column from access tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, text],
  );

  const usersWithIndex = useMemo(
    () =>
      data?.users?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [],
    [data?.users, limit, page],
  );

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
  } = useGridColumnChange("adminHistoryColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  const getDetailPanelContent = React.useCallback(
    ({ row }: GridRowParams) =>
      <DetailPanel row={row} />,
    [],
  );

  return (
    <div ref={divRef} className="h-full overflow-y-auto px-5 py-5">
      <div className="w-full mb-2 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("admin_history_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("admin_history_detail")}
        </span>
      </div>

      <Tabs
        value={type}
        className="flex mb-3 md:mb-0 pr-2"
        onChange={(_, type) => {
          setType(type);
          setPage(1);
          setLimit(25);
          resetSorting();
        }}
        sx={{
          "& .MuiTabs-scroller": {
            height: "auto !important",
          },
        }}
      >
        <Tab
          id={htmlIds.btn_user_details_select_basic_information_tab}
          label={text("admin_history_tab_activity_history")}
          className="rounded-l-lg flex-1 border border-neutral-200 border-solid"
          value="default"
        />
        <Tab
          id={htmlIds.btn_user_details_select_token_tab}
          label={text("admin_history_tab_access_history")}
          className="flex-1 border border-neutral-200  border-solid"
          value="access"
        />
        <Tab
          id={htmlIds.btn_user_details_select_transaction_history_tab}
          label={text("admin_history_tab_excel_download_history")}
          className="flex-1 border rounded-r-lg border-neutral-200 border-solid"
          value="excel"
        />
      </Tabs>

      <Divider className="my-3" />

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex flex-wrap gap-2 justify-between items-center py-3">
        <div>
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <button
            id={htmlIds.btn_admin_history_excel_download}
            disabled={massDownloadLoading || !data?.users?.length}
            onClick={() => {
              getMassAdminLogActivity(
                {
                  searchKey: dataFilter?.searchKey,
                  from_date: dataFilter?.startDate,
                  to_date: dataFilter?.endDate,
                  type: type === "default" ? undefined : type,
                },
                {
                  onSuccess: (_data) => {
                    _data.users && handleExcelDownload(_data?.users);
                  },
                  onError: (error) => {
                    console.log(error);
                  },
                },
              );
            }}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {massDownloadLoading && <Spinner />}{" "}
            <span>{text("withdrawal_information_excel_download")}</span>
          </button>
        </div>
      </div>

      <div
        className="w-full bg-white h-[65vh]"
        id={htmlIds.div_admin_history_table_container}
      >
        <DataGridPro
          getRowId={(row) => row?.id}
          rows={usersWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          autoHeight={!isFetching}
          paginationMode="server"
          rowCount={usersWithIndex.length}
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          getRowHeight={() => "auto"}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
          getDetailPanelContent={getDetailPanelContent}
          getDetailPanelHeight={() => "auto"}
        />
        <Pagination
          limits={[25, 50, 75, 100]}
          limit={limit}
          onChangeLimit={setLimit}
          page={page}
          onChangePage={setPage}
          isFetching={isFetching}
          totalPages={data?.nbTotalPage}
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

export default AdminHistoryPage;
