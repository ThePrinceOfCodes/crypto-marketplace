import { Box, CircularProgress } from "@mui/material";
import React, {
  Ref,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { useGetSuperUserDetail, useGetUserConsents } from "api/hooks";
import { useLocale } from "locale";
import { DataRow, DateFormatter } from "@common/components";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type CheckConsentHistoryModalRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};

function CheckConsentHistoryModal(
  { user_id }: { user_id: string },
  ref: Ref<CheckConsentHistoryModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details, isLoading: isUserDetailsLoading } = useGetSuperUserDetail({ email });
  const { data: consentHistory, isLoading: isConsentHistoryLoading } = useGetUserConsents({ user_id });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

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
      field: "name_of_consent",
      headerName: text("view_consent_history_header_service_name"),
      minWidth: 300,
    },
    {
      ...sharedColDef,
      field: "date_of_consent",
      headerName: text("view_consent_history_header_date_of_agreement"),
      minWidth: 200,
      renderCell: ({ value }) =>
        value && (
          <div className="flex flex-col w-full">
            <DateFormatter value={value} breakLine />
          </div>
        ),
    },
  ], [text]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("view_consent_history_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[835px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        {isUserDetailsLoading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress />
          </Box>
        ) : (
          <Box className="border overflow-x-auto">
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
          </Box>
        )}
        <Box className="flex justify-end mt-5">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
        </Box>
        <Box className="h-64 mt-4">
          {isConsentHistoryLoading ? (
            <Box className="flex justify-center items-center h-full">
              <CircularProgress />
            </Box>
          ) : (
            <DataGridPro
              getRowId={(row) => row.id}
              rows={
                consentHistory?.length
                  ? consentHistory?.map((item, index) => ({
                    ...item,
                    no: index + 1,
                  }))
                  : []
              }
              paginationMode="server"
              rowCount={consentHistory?.length || 0}
              columns={columns}
              hideFooter
              components={{
                Toolbar: showToolbar ? CustomToolbar : null,
              }}
            />
          )}
        </Box>
        <Box className="w-full flex justify-center mt-3">
          <FormFooter
            loading={isUserDetailsLoading || isConsentHistoryLoading}
            handleClose={onClose}
            submitText={text("view_consent_history_ok")}
            cancelText={text("user_withdrawal_cancel")}
            onSubmit={onClose}
            showCancelButton={false}
            sx={{ width: "160px" }}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(CheckConsentHistoryModal);
