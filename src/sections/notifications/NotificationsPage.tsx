import { DateFormatter, DataFilterType } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useLocale } from "locale";
import { DataGridPro, GridColDef, GridEventListener } from "@mui/x-data-grid-pro";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { SendNotificationModal } from "./components";
import { ISendNotificationModalSubmitData } from "./components/SendNotificationModal/types";

import { htmlIds } from "@cypress/utils/ids";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { useGetBulkNotifications, useSendBulkNotification } from "api/hooks";
import { IBulkNotifications } from "api/hooks/notifications/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { PlusIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import Link from "next/link";
import { AdsManagementStatsModal, AdsManagementStatsModalRef } from "@sections/ads-management/components";
import { matchesUrlPattern } from "@common/utils/helpers";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function NotificationsPage() {
  const { text } = useLocale();
  const { confirmDialog } = useDialog();
  const [openSendNotificationModal, setOpenSendNotificationModal] =
    useState(false);
  const [lastId, setLastId] = useState<string>();
  const [statsUrl, setStatsUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [filteredNotifications, setFilteredNotifications] =
    useState<DataFilterType>();
  const [allNotifications, setAllNotifications] = useState<
    IBulkNotifications[]
  >([]);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const viewStatsModal = useRef<AdsManagementStatsModalRef>(null);

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const { data, isFetching, refetch } = useGetBulkNotifications(
    {
      limit: 25,
      lastId,
      searchKey:
        (filteredNotifications?.searchKey?.length || 0) > 0
          ? filteredNotifications?.searchKey
          : undefined,
      ...(filteredNotifications?.startDate && {
        date_from: dayjs(filteredNotifications?.startDate).format("YYYY-MM-DD"),
        date_to: dayjs(filteredNotifications?.endDate).format("YYYY-MM-DD"),
      }),
    },
    {
      onSuccess: (data) => {
        setAllNotifications((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.bulkNotifictionData,
        ]);
      },
    },
  );

  const {
    mutateAsync: sendBulkNotificationApi,
    isLoading: isSendBulkNotificationLoading,
  } = useSendBulkNotification();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("notification_management_list_no_column_title"),
        minWidth: 50,
        type: "number",
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "title",
        headerName: text("notification_management_list_title_column_title"),
        minWidth: 250,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "body",
        headerName: text("notification_management_list_body_column_title"),
        minWidth: 250,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "link",
        headerName: text("notification_management_list_link_column_title"),
        sortable: false,
        minWidth: 200,
        renderCell: ({ row }) => {
          const link = JSON.parse(row.payload || "{}").link;
          return (
            <div className="w-full flex items-center justify-between">
              {link ? (
                <Link
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit truncate text-ellipsis hover:underline hover:text-blue-500"
                >
                  {link}
                </Link>
              ):(
                "---"
              )}
              {link && (
                <>
                  <IconButton onClick={() => copyToClipboard(link)} aria-label="copy icon">
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
                  <Tooltip title={matchesUrlPattern(link) ? text("view_ads_stats_tooltip") : text("view_ads_stats_invalid_url")} arrow placement="top">
                    <IconButton 
                    onClick={() => {
                      if(matchesUrlPattern(link)){
                        setStatsUrl(link);
                        setCreatedAt(row?.createdAt);
                        viewStatsModal.current?.open();
                      }
                    }}
                    className={`${matchesUrlPattern(link) ? "cursor-pointer" : "opacity-20 cursor-not-allowed"}`}
                    >
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Image
                        alt=""
                        width={17}
                        height={17}
                        src="/images/stats.svg"
                      />
                    </Box>
                  </IconButton>
                </Tooltip>
              </>
              )}
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "user_count",
        headerName: text(
          "notification_management_list_user_count_column_title",
        ),
        minWidth: 100,
        type: "number",
        renderCell: ({ row }) => (
          <div className="flex items-center">
            <span className="w-[75px]  truncate text-ellipsis">
              {row.user_count.toLocaleString(navigator.language) || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "notification_sent_count",
        headerName: text(
          "notification_management_list_notifications_sent_column_title",
        ),
        minWidth: 100,
        type: "number",
        renderCell: ({ row }) => (
          <div className="flex items-center">
            <span className="w-[75px]  truncate text-ellipsis">
              {row.notification_sent_count.toLocaleString(navigator.language) ||
                "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("education_management_completed_date"),
        minWidth: 160,
        type: "date",
        renderCell: ({ row }) => (
          <span className="whitespace-normal w-fit ">
            {row.createdAt ? <DateFormatter value={row.createdAt} /> : "---"}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const handleSendNotificationModalOk = async (
    data: ISendNotificationModalSubmitData,
  ) => {
    try {
      confirmDialog({
        title: text("send_notification_management_modal_confirmation_title"),
        content: text(
          "send_notification_management_modal_confirmation_content",
        ),
        onOk: async () => {
          handleModalClose();
          await sendBulkNotificationApi(data);
          toast("Success!", { type: "success" });
          setLastId(undefined);
          refetch();
        },
      });
    } catch (error) {
      //
    }
  };

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (allNotifications?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [allNotifications?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setFilteredNotifications(e);
  }, []);

  const notificationsDataWithIndex = useMemo(
    () => allNotifications.map((item, index) => ({ ...item, no: index + 1 })),
    [allNotifications],
  );

  const handleModalClose = useCallback(() => {
    setOpenSendNotificationModal(false);
  }, []);

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("notificationsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, filteredNotifications]);

  return (
    <div className="flex flex-col h-full px-5 py-5 gap-2">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("notification_management_list_page_header")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("notification_management_list_page_header_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex justify-between gap-2 items-center flex-wrap">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex gap-1 justify-end items-center py-2">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <div>
            <button
              id={htmlIds.btn_platform_add_new_platform}
              className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
              onClick={() => setOpenSendNotificationModal(true)}
            >
              <PlusIcon className="w-5 stroke-2 mr-2" />
              <span>
                {text("create_notification_management")}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={htmlIds.div_bug_report_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.id}
          rows={notificationsDataWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={notificationsDataWithIndex.length}
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

      <SendNotificationModal
        open={openSendNotificationModal}
        onOk={handleSendNotificationModalOk}
        onCancel={handleModalClose}
        isSubmitting={isSendBulkNotificationLoading}
      />

      <AdsManagementStatsModal
        ref={viewStatsModal}
        slugOrUrl={statsUrl}
        startAt={createdAt}
      />
    </div>
  );
}

export default NotificationsPage;