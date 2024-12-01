import { DataRow, DateFormatter } from "@common/components";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import {
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import {
  ApproveTransferOwnership,
  RejectTransferOwnership,
} from "@sections/user-details/components";
import {
  OwnershipTransfer,
  useGetSuperUserDetail,
  useGetUserTransferOwnershipHistory,
} from "api/hooks";
import { useLocale } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { forwardRef, Ref, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { toast } from "react-toastify";

export type CheckOwnershipTransferHistoryModalRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  headerAlign: "center",
  align: "center",
};

const statusCase = {
  0: "Waiting approval",
  1: "Approved",
  2: "Rejected",
};

function CheckOwnershipTransferHistoryModal(
  { user_id }: { user_id: string },
  ref: Ref<CheckOwnershipTransferHistoryModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details } = useGetSuperUserDetail({ email });
  const {
    data: transferHistory,
    refetch,
    isFetching,
  } = useGetUserTransferOwnershipHistory({ user_id });
  const transferResult = transferHistory?.transferResult;
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("view_consent_history_header_no"),
        minWidth: 80,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "from_user_id",
        headerName: text("transfer_history_modal_from_user"),
        minWidth: 250,
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
        field: "to_user_id",
        headerName: text("transfer_history_modal_to_user"),
        minWidth: 250,
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
        field: "request_id",
        headerName: text("transfer_history_modal_request_id"),
        minWidth: 250,
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
        field: "contract_file",
        headerName: text("transfer_history_modal_contract_pdf"),
        minWidth: 300,
        renderCell: ({ value }) =>
          value ? (
            <div className="flex w-full justify-center items-center">
              {/*<Tooltip title="PDF View">*/}
              {/*  <IconButton>*/}
              {/*    <VisibilityIcon sx={{color : "black"}} />*/}
              {/*  </IconButton>*/}
              {/*</Tooltip>*/}
              <Tooltip title="PDF Download">
                <IconButton
                  onClick={() => {
                    window.open(value, "_blank");
                  }}
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "remark",
        headerName: text("transfer_history_modal_remark"),
        minWidth: 300,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "action_date",
        headerName: text("transfer_history_modal_approval_date"),
        minWidth: 170,
        renderCell: ({ value }) =>
          value && (
            <div className="flex flex-col w-full justify-center items-center">
              <DateFormatter value={value} breakLine />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("transfer_history_modal_manager"),
        minWidth: 200,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: text("transfer_history_modal_status"),
        minWidth: 180,
        renderCell: ({ row }: { row: OwnershipTransfer }) => {
          if (row.status === 0)
            return (
              <div className="flex">
                {row.status == 0 && (
                  <div className="flex items-center justify-center">
                    <RejectTransferOwnership
                      transfer_id={row.uuid}
                      onUpdated={refetch}
                    />
                    <ApproveTransferOwnership
                      transfer_id={row.uuid}
                      onUpdated={refetch}
                    />
                  </div>
                )}
              </div>
            );

          return <div>{statusCase[row.status]}</div>;
        }
      },
    ], [text, copyToClipboard, refetch]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text(
        "user_details_basic_tab_transfer_ownership_history_modal_title",
      )}
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
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
        </div>

        <div className="h-64 mt-4">
          <DataGridPro
            loading={isFetching}
            getRowId={(row) => row.no}
            rows={
              transferResult?.length
                ? transferResult?.map((item, index) => ({
                  ...item,
                  no: index + 1,
                }))
                : []
            }
            paginationMode="server"
            rowCount={transferResult?.length || 0}
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

export default forwardRef(CheckOwnershipTransferHistoryModal);
