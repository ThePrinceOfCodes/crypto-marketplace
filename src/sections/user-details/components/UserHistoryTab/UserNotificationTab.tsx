import { DateFormatter } from "@common/components";
import { CustomCellWithExpandable } from "@common/components/CustomCellWithExpandable";
import { customisedTableClasses } from "@common/constants/classes";
import _debounce from "lodash/debounce";

import { inViewport } from "@common/utils/helpers";
import { toast } from "react-toastify";

import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { useGetSuperUserDetail, useGetUserNotification } from "api/hooks";
import { useLocale } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};
function UserNotificationTab() {
  const { text } = useLocale();
  const prevScrollTopRef = useRef(0);
  const email = useRouter().query.email as string;

  const divRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data: userDetails } = useGetSuperUserDetail({
    email: email,
  });

  const {
    data: userNotification,
    isLoading,
    isFetching,
    fetchNextPage,
  } = useGetUserNotification({
    user_id: userDetails?.user_id,
    limit: 25,
  });

  const usersNotificationIndex =
    userNotification?.notifications?.map((item) => ({ ...item })) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;
    // check if user scrolls down
    if (currentScrollTop > prevScrollTopRef.current) {
      if (userNotification && userNotification.hasNext) {
        const el = document.querySelector(
          `div[data-id="${userNotification.lastId}"]`,
        );
        // if last element is in viewport, fetch more data
        if (el && inViewport(el)) {
          fetchNextPage({
            pageParam: {
              lastId: userNotification?.lastId,
              lastCreatedAt: userNotification?.lastCreatedAt,
            },
          });
        }
      }
    }
    prevScrollTopRef.current = currentScrollTop;
  }, 500);

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
        field: "data",
        headerName: text("users_notification_header_data"),
        minWidth: 500,
        autoWidth: true,
        flex: 1,
        renderCell: ({ value }) => {
          try {
            const parsedJson = JSON.parse(value);
            return (
              <span>
                <CustomCellWithExpandable
                  text={`${parsedJson.name || "No name"} --
                   ${parsedJson.amount_usd || 0} USD  --                   ${
                    parsedJson.deposit_token || "MSQ"
                  }
                  `}
                />
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
        field: "id",
        headerName: text("users_notification_header_id"),
        minWidth: 300,
        renderCell: ({ value }) =>
          value && (
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
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "is_sent",
        headerName: text("users_notification_header_status"),
        minWidth: 250,
        flex: 1,
        renderCell: ({ value }) => (
          <div className="flex items-center">
            <span className="w-[150px] truncate text-ellipsis">
              {value ? "successful" : "not successful"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "type",
        headerName: text("users_notification_header_type"),
        minWidth: 250,
        flex: 1,
        renderCell: ({ value }) => (
          <div className="flex items-center">
            <span className="w-[150px] truncate text-ellipsis">
              {value?.length ? value : "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("users_notification_header_created_at"),
        minWidth: 300,
        flex: 1,
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ),
      },
    ],
    [text, copyToClipboard],
  );

  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("tdUsersNotificationColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div>
      <div className="flex w-full gap-1 justify-between items-center py-4 md:py-3">
        <div>
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>

        <ShowToolbar
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
      </div>
      <div
        className="w-full mt-2 bg-white tableContainer pb-10"
        onScrollCapture={debouncedOnScroll}
      >
        <DataGridPro
          rows={usersNotificationIndex || []}
          rowCount={usersNotificationIndex?.length || 0}
          getRowId={(row) => row.id}
          columns={columns}
          loading={isFetching || isLoading}
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
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default UserNotificationTab;
