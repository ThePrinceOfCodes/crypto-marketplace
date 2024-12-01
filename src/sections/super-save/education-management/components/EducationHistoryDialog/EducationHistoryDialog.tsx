import {
  Box,
} from "@mui/material";
import React, {
  Ref,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import _debounce from "lodash/debounce";
import { useGetSuperUserDetail, useGetUserEducationHistory } from "api/hooks";
import { useLocale } from "locale";
import { DataRow, DateFormatter, Spinner } from "@common/components";
import {
  EducationHistoryDialogProps,
  EducationHistoryDialogRef,
} from "./types";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import {
  getEducationStatusLabelText,
  getEducationStatusStyles,
} from "../../educationManagementPage";
import { inViewport } from "@common/utils/helpers";
import { IEducationHistoryItem } from "api/hooks/user-education/types";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  disableColumnMenu: true,
};

function EducationHistoryDialog(
  props: EducationHistoryDialogProps,
  ref: Ref<EducationHistoryDialogRef>,
) {
  const { user, onClose: propsOnClose } = props;
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const prevScrollTopRef = useRef(0);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const [lastId, setLastId] = useState<string>();
  const [lastCreatedAt, setLastCreatedAt] = useState<number>();
  const [userEducationHistoryList, setUserEducationHistoryList] = useState<
    IEducationHistoryItem[]
  >([]);
  const { data: user_details, isFetching: educationUserLoading } =
    useGetSuperUserDetail(
      { email: user?.user_email },
      {
        enabled: !!user?.user_email,
      },
    );
  const {
    data: userEducationHistoryData,
    isFetching: userEducationHistoryLoading,
    refetch,
  } = useGetUserEducationHistory(
    { user_id: user?.user_id, lastId, createdAt: lastCreatedAt, limit: 25 },
    {
      enabled: !!user?.user_id && !!user_details,
      onSuccess: (data) => {
        setUserEducationHistoryList((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.dataList,
        ]);
      },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;

    // check if user scrolls down
    if (currentScrollTop > prevScrollTopRef.current) {
      if (userEducationHistoryData && userEducationHistoryData.hasNext) {
        const el = document.querySelector(
          `div[data-id="${userEducationHistoryData.lastId}"]`,
        );
        // if last element is in viewport, fetch more data
        if (el && inViewport(el)) {
          setLastId(userEducationHistoryData.lastId);
          setLastCreatedAt(userEducationHistoryData.createdAt);
        }
      }
    }
    prevScrollTopRef.current = currentScrollTop;
  }, 500);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setOpen(true);
        if (user_details) {
          refetch();
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch],
  );

  const onClose = () => {
    setOpen(false);
    setLastId(undefined);
    setLastCreatedAt(undefined);
    setUserEducationHistoryList([]);
    if (propsOnClose) {
      propsOnClose();
    }
  };

  const columns: GridColDef[] = [
    {
      ...sharedColDef,
      field: "no",
      headerName: text("view_commitment_information_header_no"),
      minWidth: 10,
      disableReorder: true,
    },
    {
      ...sharedColDef,
      field: "education_round",
      headerName: text("education_management_round"),
      minWidth: 150,
      width: 150,
      renderCell: ({ row }) => {
        return (
          <p className="truncate">{row?.education_round || 1}</p>
        );
      },
    },
    {
      ...sharedColDef,
      field: "education_date",
      headerName: text("education_management_education_column_education_date"),
      minWidth: 150,
      width: 150,
      renderCell: ({ row }) =>
        row.education_date ? (
          <p className="truncate">
            <DateFormatter
              value={row.education_date}
              format="YYYY-MM-DD HH:mm"
            />
          </p>
        ) : (
          <p className="truncate">N/A</p>
        ),
    },
    {
      ...sharedColDef,
      field: "photo",
      headerName: text("education_management_photo"),
      minWidth: 100,
      width: 100,
      renderCell: ({ row }) =>
        <button
          className={`flex items-center text-xs px-2 h-6 rounded-md ${row.file ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
            }`}
          onClick={() => {
            if (row.file) {
              setModalFileUrl(row.file);
              viewFilesModal.current?.open();
            }
          }}
          disabled={!row.file}
        >
          {text("education_management_page_column_view")}
        </button>
    },
    {
      ...sharedColDef,
      field: "completed_date",
      headerName: text("education_management_completed_date"),
      minWidth: 150,
      width: 150,
      renderCell: ({ row }) =>
        row.completed_date ? (
          <p className="truncate">
            <DateFormatter
              value={row.completed_date}
              format="YYYY-MM-DD HH:mm"
            />
          </p>
        ) : (
          <p className="truncate">N/A</p>
        ),
    },
    {
      ...sharedColDef,
      field: "disabled_date",
      headerName: text("education_management_disabled_date"),
      minWidth: 150,
      width: 150,
      renderCell: ({ row }) =>
        row.disabled_date ? (
          <p className="truncate">
            <DateFormatter
              value={row.disabled_date}
              format="YYYY-MM-DD HH:mm"
            />
          </p>
        ) : (
          <p className="truncate">N/A</p>
        ),
    },
    {
      ...sharedColDef,
      field: "submitted_date",
      headerName: text("education_management_submitted_date"),
      minWidth: 150,
      width: 150,
      renderCell: ({ row }) => {
        return row.submitted_date ? (
          <p className="truncate">
            <DateFormatter
              value={row.submitted_date}
              format="YYYY-MM-DD HH:mm"
            />
          </p>
        ) : (
          <p className="truncate">N/A</p>
        );
      },
    },
    {
      ...sharedColDef,
      field: "action",
      headerName: text("education_management_status"),
      minWidth: 180,
      width: 180,
      renderCell: ({ row }) => {
        const rowStatus = row.status;
        const { button, text: textStyle } = getEducationStatusStyles(rowStatus);
        return (
          <button
            onClick={() => { }}
            className={`w-full flex items-center justify-center text-xs px-2 h-8 text-white rounded-md ${button}`}
          >
            <span className={textStyle}>
              {text(getEducationStatusLabelText(rowStatus))}
            </span>
          </button>
        );
      },
    },
    {
      ...sharedColDef,
      field: "action_by",
      headerName: text("deposit_information_column_manager"),
      minWidth: 180,
      width: 180,
      renderCell: ({ row }) => {
        return row.action_by ? (
          <div className="flex items-center">
            <span className="pl-2">{row.action_by}</span>
          </div>
        ) : (
          <p className="pl-2">N/A</p>
        );
      },
    },
  ];

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("view_education_history_dialog_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[855px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        {educationUserLoading ? (
          <div className="flex justify-center item-center h-64">
            <Spinner size={8} />
          </div>
        ) : (
          <>
            <div className="border overflow-x-auto">
              <DataRow
                label={text("view_education_history_dialog_user_name")}
                value={<p>{user_details?.msq_name || "---"}</p>}
              />
              <DataRow
                label={text("view_education_history_dialog_user_email")}
                value={<p>{user_details?.email || "---"}</p>}
              />
              <DataRow
                label={text("view_education_history_dialog_user_phone")}
                value={<p>{user_details?.phone_number || "---"}</p>}
              />
            </div>

            <div
              onScrollCapture={debouncedOnScroll}
              className="w-full bg-white flex-grow h-64 mt-4"
            >
              <DataGridPro
                getRowId={(row) => row.uuid}
                rows={userEducationHistoryList.map((item, index) => ({
                  id: index,
                  ...item,
                  no: index + 1,
                }))}
                paginationMode="server"
                rowCount={[]?.length || 0}
                columns={columns}
                loading={userEducationHistoryLoading}
                hideFooter
              />
            </div>
          </>
        )}
        <ViewFilesModal
          ref={viewFilesModal}
          files={[{ file_name: "education_images", file_url: modalFileUrl }]}
        />

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FormFooter
            showCancelButton={false}
            onSubmit={onClose}
            submitText={text("view_commitment_information_ok")}
            sx={{ width: "144px" }}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(EducationHistoryDialog);
