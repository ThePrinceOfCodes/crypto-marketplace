import {
  Box,
  IconButton,
} from "@mui/material";
import React, { Ref, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { useGetSuperUserDetail, useGetUserInheritors } from "api/hooks";
import Image from "next/image";
import { useLocale } from "locale";
import { DataRow, DateFormatter } from "@common/components";
import { DataGridPro, GridCheckCircleIcon, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { CancelOutlined } from "@mui/icons-material";
import FormFooter from "@common/components/FormFooter";
import CustomDialog from "@common/components/CustomDialog";

export type UserInheritorsModalRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

function UserInheritorsModal(
  { user_id }: { user_id: string },
  ref: Ref<UserInheritorsModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details } = useGetSuperUserDetail({ email });
    const { data: userInheritor } = useGetUserInheritors({ user_id, all: true});
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const copyToClipboard = useCallback((textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  }, [text]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const onClose = () => {
    setOpen(false);
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      ...sharedColDef,
      field: "no",
      headerName: text("view_consent_history_header_no"),
      minWidth: 80,
      disableReorder: true
    },
    {
      ...sharedColDef,
      field: "uuid",
      headerName: text("users_inheritor_id"),
      minWidth: 200,
      renderCell: ({ value }) => (
        <div className="flex items-center">
          <span className="w-[150px] truncate text-ellipsis">{value}</span>
          <IconButton onClick={() => copyToClipboard(value)}>
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
      field: "name",
      headerName: text("users_inheritor_name"),
      minWidth: 150,
    },
     {
      ...sharedColDef,
      field: "bank_name",
      headerName: text("users_inheritor_bank_name"),
      minWidth: 150,
    },
    {
      ...sharedColDef,
      field: "bank_account_number",
      headerName: text("users_inheritor_bank_account_number"),
      minWidth: 170,
    },
    {
      ...sharedColDef,
      field: "phone_number",
      headerName: text("users_inheritor_phone_number"),
      minWidth: 150,
    },
    {
      ...sharedColDef,
      field: "registration_number",
      headerName: text("users_inheritor_Registration_number"),
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: ({ row }) => (
        <div className="flex items-center">
          {row.status === 1 ? (
            <span className="flex items-center justify-between w-[5rem]">
             <span className="ml-2">{text("users_inheritor_active")}</span>
              <GridCheckCircleIcon className="text-green-500" />
            </span>
          ) : (
            <span className="flex items-center justify-between w-[5rem]">
             <span className="ml-2">{text("users_inheritor_disable")}</span>
              <CancelOutlined className="text-red-500" />
            </span>
          )}
        </div>
      ),
    },
    {
      ...sharedColDef,
      field: "createdAt",
      headerName: text("users_inheritor_createdAt"),
      minWidth: 150,
      renderCell: ({ value }) =>
        value && (
          <p className="truncate"><DateFormatter value={value} breakLine /></p>
        ),
    },
  ], [text, copyToClipboard]);

  return (
    <CustomDialog titleText={text("users_inheritor_modal_title")} maxWidth="md" open={open} onClose={onClose}>
      <Box className="">
        <div className="border border-1">
          <DataRow
            label={text("view_consent_history_user_name")}
            value={<p>{user_details?.msq_name}</p>}
          />
          <DataRow
            label={text("view_consent_history_user_id")}
            value={<p>{user_details?.id}</p>}
          />
          <DataRow
            label={text("view_consent_history_email")}
            value={<p>{user_details?.email}</p>}
          />
        </div>

        <div className="flex justify-end mt-4">
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
        </div>

        <div className="h-64 mt-4">
          <DataGridPro
            getRowId={(row) => row.uuid}
            rows={
              userInheritor?.inheritors?.length
                ? userInheritor?.inheritors?.map((item, index) => ({
                  ...item,
                  no: index + 1,
                }))
                : []
            }
            paginationMode="server"
            rowCount={userInheritor?.inheritors?.length || 0}
            columns={columns}
            hideFooter
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
            sx={{
              "& .MuiDataGrid-row": {
                "&.status-1": {
                  backgroundColor: "#bbf7d0 !important",
                },
                "&.status-0": {
                  backgroundColor: "#fecaca !important",
                },
            },
            }}
            getRowClassName={(params) =>
              params?.row?.status === 1 ? "status-1" : "status-0"
            }
          />
        </div>
      </Box>
      <Box className="w-full flex items-center justify-center mt-2 ">
        <FormFooter
          showCancelButton={false}
          onSubmit={onClose}
          submitText={text("view_consent_history_ok")}
          sx={{ width: "144px" }}
        />
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(UserInheritorsModal);
