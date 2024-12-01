import { Box, CircularProgress } from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { useGetSuperUserDetail, useGetUserReferralInfo } from "api/hooks";
import Image from "next/image";
import { useLocale } from "locale";
import { DataRow, DateFormatter } from "@common/components";
import Link from "next/link";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type CheckReferralInfoModalRef = {
  open: () => void;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};

function CheckReferralInfoModal(
  { user_id }: { user_id: string },
  ref: Ref<CheckReferralInfoModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const email = useRouter().query.email as string;
  const { data: user_details, isLoading: isUserDetailsLoading } = useGetSuperUserDetail({ email });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  
  const { data: userReferralInfoListRes, isLoading: isUserReferralInfoListRes } = useGetUserReferralInfo({
    user_id,
  });

  const userCommitmentInfoList = useMemo(() => userReferralInfoListRes?.referralResult || [], [userReferralInfoListRes]);

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
      field: "to_user_name",
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
      field: "to_user_phone",
      headerName: text("view_commitment_information_header_phone"),
      minWidth: 180,
      renderCell: ({ value }) => value ? (<p>{value}</p>) : ("---")
    },
    {
      ...sharedColDef,
      field: "referral_date",
      headerName: text("view_referral_information_header_referral_date"),
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
      titleText={text("view_referral_information_title")}
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
              value={<p>{text("deposit_information_request_type_credit_sale")}</p>}
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
          {isUserReferralInfoListRes ? (
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
        </Box>
        <Box className="w-full flex justify-center mt-3">
          <FormFooter
            loading={isUserDetailsLoading || isUserReferralInfoListRes}
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

export default forwardRef(CheckReferralInfoModal);
