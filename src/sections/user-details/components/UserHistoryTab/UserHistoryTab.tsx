import {
  DataFilter,
  DataFilterType,
  DateFormatter,
  Pagination,
} from "@common/components";
import { CustomCellWithExpandable } from "@common/components/CustomCellWithExpandable";
import { customisedTableClasses } from "@common/constants/classes";
import { useTimezone } from "@common/hooks";
import { formatDate, formatDateAndTime } from "@common/utils/formatters";
// import _debounce from "lodash/debounce";

import {
  arrayToString,
  isValidJSON,
  resetMUIToolbarFilter,
  useCopyToClipboard,
} from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import { Button, Box, Tabs, Tab } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import {
  Iusers,
  useGetSuperUserDetail,
  useGetUserHistory,
  usePostAdminHistoryLog,
} from "api/hooks";
import { ServerLocalTypes, useLocale, LocalKeys } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useInitialTabRender from "@common/hooks/useInitialTabRender";
import UserNotificationTab from "./UserNotificationTab";
import UserHistoryDetailDialog from "./components/UserHistoryDetailDialog/UserHistoryDetailDialog";
import { UserHistoryDetailDialogRef } from "./components";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

const sunTabOptions = ["users_history_tab", "users_notification_tab"];

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-label": `simple-tabpanel-${index}`,
  };
}

function UserHistoryTab() {
  const { locale, text } = useLocale();
  const { timezone } = useTimezone();
  const copyToClipboard = useCopyToClipboard();
  const email = useRouter().query.email as string;
  const router = useRouter();
  const divRef = useRef<HTMLDivElement>(null);
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [value, setValue] = useState(0);
  const [userHistoryDetails, setUserHistoryDetails] = useState<Iusers>();
  const { initialRender, setInitialRender } = useInitialTabRender(1);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const userHistoryDetailDialogRef = useRef<UserHistoryDetailDialogRef>(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  const { data: userDetails } = useGetSuperUserDetail({
    email: email,
  });

  const { data: userHistory, isFetching } = useGetUserHistory({
    user_id: userDetails?.user_id,
    limit: limit,
    page: page,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
    searchKey: dataFilter?.searchKey || "",
  });

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  const usersWithIndex = useMemo(() => {
    const users =
      userHistory?.users?.map((item: Iusers, index: number) => ({
        no: limit * (page - 1) + index + 1,
        ...item,
      })) || [];
    return [...users];
  }, [limit, page, userHistory?.users]);

  const handleShowDetails = useCallback((row: Iusers) => {
    setUserHistoryDetails(row);
    userHistoryDetailDialogRef.current?.open();
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("users_history_header_no"),
        width: 80,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "content",
        headerName: text("users_history_header_content"),
        minWidth: 900,
        autoWidth: true,
        flex: 1,
        renderCell: ({ value }) => {
          try {
            const parsedJson = JSON.parse(value)[ServerLocalTypes[locale]];
            return (
              <span>
                <CustomCellWithExpandable text={parsedJson} />
              </span>
            );
          } catch (e) {
            return (
              <span>
                <CustomCellWithExpandable text={value} />
              </span>
            );
          }
        },
      },
      {
        ...sharedColDef,
        field: "details",
        headerName: text("users_history_header_details"),
        minWidth: 120,
        renderCell: ({ row }) => {
          const changedVariables = (isValidJSON(row.content || "{}") && JSON.parse(row.content || "{}")).changedVariables;
          return (
            <button
              className={`flex items-center text-xs px-2 h-6 rounded-md ${changedVariables ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
                }`}
              onClick={() => {
                if (changedVariables) {
                  handleShowDetails(row);
                }
              }}
              disabled={!changedVariables}
            >
              {text("users_history_header_show_details_button_text")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "uuid",
        headerName: text("users_history_header_uuid"),
        minWidth: 300,
        renderCell: ({ value }) =>
          value ? (
            <div className="flex items-center">
              <span className="w-[200px] truncate text-ellipsis">{value}</span>
              <Image
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>)
            : (
              "---"
            ),
      },

      {
        ...sharedColDef,
        field: "ip_address",
        headerName: text("super_save_admin_history_header_ip_address"),
        minWidth: 250,
        flex: 1,
        renderCell: ({ value }) => (
          value ? (
            <div className="flex items-center">
              <span className="w-[150px] truncate text-ellipsis">
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
        ),
      },
      {
        ...sharedColDef,
        field: "app_version",
        headerName: text("table_column_app_version"),
        minWidth: 150,
        renderCell: ({ value }) => (
          <p className="truncate">{value ? value : "--"}</p>
        ),
      },
      {
        ...sharedColDef,
        field: "admin_name",
        headerName: text("table_column_manager"),
        minWidth: 150,
        renderCell: ({ value }) => (
          <p className="truncate">{value ? value : "--"}</p>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("users_history_header_created_at"),
        minWidth: 120,
        flex: 1,
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const handleExcelDownload = (data: Iusers[]) => {
    jsonToExcelDownload(
      data.map((item, index) => ({
        [text("users_history_header_no")]: index + 1,
        [text("users_history_header_content")]: item.content,
        [text("users_history_header_uuid")]: item.uuid,
        [text("super_save_admin_history_header_ip_address")]: item?.ip_address
          ?.length
          ? item.ip_address
          : "---",
        [text("table_column_app_version")]: item.app_version || "---",
        [text("table_column_manager")]: item.admin_name || "---",
        [text("users_history_header_created_at")]: formatDateAndTime(
          item.createdAt,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
      })),
      `${arrayToString([text("user_history_header"), formatDate(new Date())])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("user_history_header"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  const handleDataFilterChange = useCallback(
    (dataFilter: DataFilterType) => {
      setPage(1);
      setDataFilter(dataFilter);
    },
    [
      router.query.searchKey,
      router.query.startDate,
      router.query.endDate,
      router.isReady,
    ],
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
    resetSorting,
    setOpenConfirmDialog,
  } = useGridColumnChange("userHistoryTabColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setInitialRender(newValue);
    setValue(newValue);
    setPage(1);
    setLimit(25);
    resetSorting();
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`basic-information-tabpanel-${index}`}
        aria-labelledby={`basic-information-tab-${index}`}
        {...other}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </div>
    );
  }, []);

  return (
    <div ref={divRef} className="h-full px-5 py-5">
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="platform detail tabs"
        className="flex"
      >
        {sunTabOptions.map((tab, index) => (
          <Tab
            key={index}
            label={text(tab as LocalKeys)}
            {...a11yProps(index)}
            className="flex-1 border border-neutral-200  border-solid"
          />
        ))}
      </Tabs>
      <TabPanel value={value} index={0}>
        <div className="flex min-h-full flex-col 2xl:flex-row gap-1 overflow-x-auto pt-2 custom_scroll_bar">
          <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
        </div>
        <div className="flex justify-between mt-3">
          <div>
            {Object.keys(columnCurrentState).length > 0 && (
              <div className="flex pt-2">
                <SaveNResetButtons
                  saveHandler={() => setOpenConfirmDialog(true)}
                  resetHandler={handleResetDefault}
                />
              </div>
            )}
          </div>

          <div className="flex">
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            <button
              id={htmlIds.btn_user_history_excel_download}
              onClick={() =>
                userHistory?.users && handleExcelDownload(userHistory?.users)
              }
              className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md leading-4 ml-1"
            >
              <span>{text("withdrawal_information_excel_download")}</span>
            </button>
          </div>
        </div>

        <div className="w-full mt-2 bg-white tableContainer">
          <DataGridPro
            rows={usersWithIndex}
            rowCount={userHistory?.users?.length || 0}
            getRowId={(row) => row.id}
            columns={columns}
            loading={isFetching}
            disableSelectionOnClick
            paginationMode="server"
            sx={customisedTableClasses}
            hideFooter
            autoHeight={!isFetching}
            apiRef={apiRef}
            onColumnOrderChange={() => handleColumnChange(false)}
            onSortModelChange={() => handleColumnChange(true)}
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
            totalPages={userHistory?.nbTotalPage}
            isFetching={isFetching}
            id={"userHistory"}
          />
        </div>

        <ConfirmationDialog
          openConfirmDialog={openConfirmDialog}
          setOpenConfirmDialog={setOpenConfirmDialog}
          onYesHandler={handleSaveView}
        />
        <UserHistoryDetailDialog
          ref={userHistoryDetailDialogRef}
          data={userHistoryDetails}
        />
      </TabPanel>

      {!initialRender[1] && (
        <TabPanel value={value} index={1}>
          <UserNotificationTab />
        </TabPanel>
      )}
    </div>
  );
}

export default UserHistoryTab;
