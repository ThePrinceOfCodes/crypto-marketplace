import {
  Box,
  IconButton,
} from "@mui/material";
import React, { Ref, forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { useGetSuperUserDetail, useGetUserSuperTrustHistory } from "api/hooks";
import Image from "next/image";
import { useLocale } from "locale";
import { DataRow, DateFormatter } from "@common/components";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type SuperTrustHistoryModelRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

function SuperTrustHistoryModel(
  { user_id }: { user_id: string },
  ref: Ref<SuperTrustHistoryModelRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details } = useGetSuperUserDetail({ email });
  const { data: superTrustHistory } = useGetUserSuperTrustHistory({ user_id });
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
      headerName: text("view_super_trust_history_id"),
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
      field: "enable_action_by",
      headerName: text("view_super_trust_history_enable_action_by"),
      minWidth: 150,
    },
    {
      ...sharedColDef,
      field: "enable_action_date",
      headerName: text("view_super_trust_history_enable_action_date"),
      minWidth: 150,
      renderCell: ({ value }) =>
        value && (
          <p className="truncate"><DateFormatter value={value} breakLine /></p>
        ),
    },
    {
      ...sharedColDef,
      field: "disable_action_by",
      headerName: text("view_super_trust_history_disable_action_by"),
      minWidth: 150,
        renderCell: ({ value }) => (
          <p className="truncate">{value || "---"}</p>
        ),
    },
    {
      ...sharedColDef,
      field: "disable_action_date",
      headerName: text("view_super_trust_history_disable_action_date"),
      minWidth: 150,
      renderCell: ({ value }) =>  
        value ? (
          <p className="truncate"><DateFormatter value={value} breakLine /></p>
        ) : (
          "---"
        ),
    },
  ], [text, copyToClipboard]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("view_super_trust_history_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[955px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <div className="border overflow-x-auto">
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
              superTrustHistory?.userTrustHistory?.length
                ? superTrustHistory?.userTrustHistory?.map((item, index) => ({
                  ...item,
                  no: index + 1,
                }))
                : []
            }
            paginationMode="server"
            rowCount={superTrustHistory?.userTrustHistory?.length || 0}
            columns={columns}
            hideFooter
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
          />
        </div>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FormFooter
            showCancelButton={false}
            onSubmit={onClose}
            submitText={text("view_consent_history_ok")}
            sx={{ width: "144px" }}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(SuperTrustHistoryModel);
