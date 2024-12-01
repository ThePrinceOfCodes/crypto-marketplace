import { htmlIds } from "@cypress/utils/ids";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { DataGridPro, GridColDef, useGridApiRef } from "@mui/x-data-grid-pro";
import {
  Avatar,
  Box,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { useDialog } from "@common/context";
import { useRouter } from "next/router";
import { customisedTableClasses } from "@common/constants/classes";
import { useAuth } from "@common/context";
import { useLocale } from "locale";
import { useGetUserAppConnection, useDisconnectApp } from "api/hooks";
import { DateFormatter } from "@common/components/DateFormatter";
import { ShowEmail } from "@common/components";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function AppConnectionData() {
  const { confirmDialog } = useDialog();
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const { text } = useLocale();
  const { userRole } = useAuth();
  const email = useRouter().query.email as string;
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data, isLoading, isFetching } = useGetUserAppConnection({ email: email });

  const {
    mutateAsync: disconnectUserApp,
  } = useDisconnectApp();

  const appConnections =
    data?.app_connections?.map((item) => ({ ...item })) || [];

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const handleDisconnectApp = (row: any) => {
    const requestBody = {
      email: row.user,
      request_key: row.uuid,
    };
    confirmDialog({
      title: text("user_details_app_disconnect_confirmation"),
      onOk: async () => {
        try {
          await disconnectUserApp(requestBody);
          toast("App Disconnected successfully", {
            type: "success",
          });
        } catch (error) {
          toast("An error occurred while disconnecting", {
            type: "error",
          });
        }
      },
    });
  }


  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "name",
        headerName: `${text("add_platform_header_name")}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return (
            <div className="flex items-center">
              <Avatar alt="platform" src={row.platform_logo} />
              <span className="pl-2">{row.platform_name}</span>
              <Link
                href={`/platform-details?platform=${row.uuid}&platformName=${row.platform_name}&&platform_user=${row.user_id}&url=${row.platform_url}&logo=${row.platform_logo}&createdAt=${row.createdAt}`}
              >
                <Image
                  className="ml-4 mt-0.5 cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "platform_url",
        headerName: `${text("add_platform_header_url")}`,
        minWidth: 160,
        renderCell: ({ row }) => {
          return (
            <div className="flex">
              <span className="w-[100px] truncate text-ellipsis">
                {row.platform_url}
              </span>
              <Image
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
                onClick={() => copyToClipboard(row.platform_url)}
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "user_id",
        headerName: `${text("add_platform_header_platform_user")}`,
        minWidth: 160,
        hide: userRole == 0 ? false : true,
        renderCell: ({ row }) => (
          <div className="flex items-center">
            <span className="w-[200px] truncate text-ellipsis">
              {!showEmail && "invisible" ? "*****@*****" : row.user_id}
            </span>
            <IconButton onClick={() => copyToClipboard(row.user_id)}  aria-label="copy icon">
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
        field: "createdAt",
        headerName: `${text("add_platform_header_created_at")}`,
        minWidth: 110,
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ),
      },
      /*{
        ...sharedColDef,
        field: "expiration",
        headerName: `${text("add_platform_header_expiration")}`,
        minWidth: 110,
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ),
      },*/
      {
        ...sharedColDef,
        field: "action",
        headerName: `${text("user_details_basic_tab_app_connection_action")}`,
        minWidth: 200,
        width: 100,
        renderCell: ({ row }) =>
        (
          <button
            className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md  mr-2"
            onClick={() => handleDisconnectApp(row)}
          >
            Disconnect
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const apiRef = useGridApiRef();



  return (
    <div className="h-full">
      <div className="flex justify-end w-full">
        <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
        <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
      </div>
      <div
        id={htmlIds.app_connection_page_platforms_container}
        className="w-full bg-white tableContainer"
      >
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={appConnections || []}
          columns={columns}
          loading={
            isLoading ||
            isFetching
          }
          rowCount={appConnections.length || 0}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          apiRef={apiRef}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
    </div>
  );
}
export default AppConnectionData;
