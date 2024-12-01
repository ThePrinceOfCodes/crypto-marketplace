import { Box, CircularProgress } from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { IGetCommitmentReferralResult, useGetSuperUserDetail, useGetUserCommitmentInfo } from "api/hooks";
import Image from "next/image";
import { useLocale } from "locale";
import { DataRow, DateFormatter } from "@common/components";
import CheckCommitmentContentModal, { CheckCommitmentContentModalRef } from "./components/CheckCommitmentContentModal/CheckCommitmentContentModal";
import Link from "next/link";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type CheckCommitmentInfoModalRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};

function CheckCommitmentInfoModal(
  { user_id }: { user_id: string },
  ref: Ref<CheckCommitmentInfoModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details, isLoading: isUserDetailsLoading } = useGetSuperUserDetail({ email });
  const [selectedCommitmentRow, setSelectedCommitmentRow] = useState<IGetCommitmentReferralResult | null>(null);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  
  const { data: userCommitmentInfoListRes, isLoading: isUserCommitmentInfoListRes } = useGetUserCommitmentInfo({
    user_id,
  });

  const checkCommitmentContentModalRef = useRef<CheckCommitmentContentModalRef>(null);


  const userCommitmentInfoList = useMemo(() => userCommitmentInfoListRes?.referralResult || [], [userCommitmentInfoListRes]);

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
      headerName: text("view_commitment_information_header_no"),
      minWidth: 10,
      disableReorder: true
    },
    {
      ...sharedColDef,
      field: "content",
      headerName: text("view_commitment_information_header_content"),
      minWidth: 80,
      renderCell: ({ row }) => {
        return (
          <div className="flex items-center">
            <button
              onClick={() => {
                setSelectedCommitmentRow(row);
                checkCommitmentContentModalRef.current?.open();
              }}
              className={"flex items-center text-xs px-2 h-6 text-white rounded-md bg-blue-500"}
            >{text("view_commitment_information_header_content_view_btn_text")}</button>
          </div>
        );
      }
    },
    {
      ...sharedColDef,
      field: "referral_code",
      headerName: text("view_commitment_information_header_referral_code"),
      minWidth: 120,
      renderCell: ({ value }) => value ? (<p>{value}</p>) : ("---")
    },
    {
      ...sharedColDef,
      field: "percentage",
      headerName: text("view_commitment_information_header_percentage"),
      minWidth: 80,
      renderCell: ({ value }) => value ? (<p>{value}%</p>) : ("---")
    },
    {
      ...sharedColDef,
      field: "from_user_name",
      headerName: text("view_commitment_information_header_name"),
      minWidth: 180,
      renderCell: ({ value }) =>
        value ? (
          <div className="w-full flex items-center justify-between">
            <span className="w-[150px] truncate flex-grow">{value}</span>
            <Link
              href={`/super-save/deposit-information?searchKey=${value}`}
              target="_blank"
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
        ) : (
          "---"
        ),
    },
    {
      ...sharedColDef,
      field: "from_user_phone",
      headerName: text("view_commitment_information_header_phone"),
      minWidth: 180,
      renderCell: ({ value }) => value ? (<p>{value}</p>) : ("---")
    },
    {
      ...sharedColDef,
      field: "commitment_date",
      headerName: text("view_commitment_information_header_commitment_date"),
      minWidth: 180,
      renderCell: ({ row }) => row.createdAt ? (
        <DateFormatter value={row.createdAt} showZone />
      ) : ("---")
    },
  ], [text]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("view_commitment_information_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[972px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        {isUserDetailsLoading ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress />
          </Box>
        ) : (
          <Box className="border overflow-x-auto">
            <DataRow
              label={text("view_commitment_information_user_name")}
              value={<p>{user_details?.msq_name}</p>}
            />
            <DataRow
              label={text("view_commitment_information_user_id")}
              value={<p>{user_details?.id}</p>}
            />
            <DataRow
              label={text("view_commitment_information_email")}
              value={<p>{user_details?.email}</p>}
            />
            <DataRow
              label={text("view_commitment_information_type")}
              value={<p>{text("deposit_information_request_type_super_save")}</p>}
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
          {isUserCommitmentInfoListRes ? (
            <Box className="flex justify-center items-center h-full">
              <CircularProgress />
            </Box>
          ) : (
            <DataGridPro
              getRowId={(row) => row.id}
              rows={
                userCommitmentInfoList?.length
                  ? userCommitmentInfoList?.map((item, index) => ({
                    ...item,
                    no: index + 1,
                  }))
                  : []
              }
              paginationMode="server"
              rowCount={userCommitmentInfoList?.length || 0}
              columns={columns}
              hideFooter
              components={{
                Toolbar: showToolbar ? CustomToolbar : null,
              }}
            />
          )}
          <CheckCommitmentContentModal
            ref={checkCommitmentContentModalRef}
            data={selectedCommitmentRow}
            onClose={() => setSelectedCommitmentRow(null)}
          />
        </Box>
        <Box className="w-full flex justify-center mt-3">
          <FormFooter
            loading={isUserDetailsLoading || isUserCommitmentInfoListRes}
            handleClose={onClose}
            submitText={text("view_commitment_information_ok")}
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

export default forwardRef(CheckCommitmentInfoModal);
