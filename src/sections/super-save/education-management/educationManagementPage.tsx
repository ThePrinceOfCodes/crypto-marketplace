import {
  DateFormatter,
  DataFilterType,
  Pagination,
  Spinner,
  ShowEmail,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import {
  DataGridPro,
  GridColDef,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useDialog } from "@common/context";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { htmlIds } from "@cypress/utils/ids";
import {
  useGetUserEducation,
  useResetEducationManual,
  useApproveEducationAll,
  useUpdateUserEducation,
  useGetSettings,
} from "api/hooks";
import { EducationSwitch } from "./components";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import { DynamicStatusFilter } from "@common/components/DynamicStatusFilter";
import { Button, Tooltip, IconButton, Box } from "@mui/material";
import {
  EducationResetDialog,
  EducationResetDialogRef,
  IEducationResetDialogSubmitData,
} from "./components/EducationResetDialog";
import { EducationCronDialogRef } from "./components/EducationCronDialog/types";
import { EducationCronDialog } from "./components/EducationCronDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EducationHistoryDialog from "./components/EducationHistoryDialog/EducationHistoryDialog";
import {
  EducationHistoryDialogRef,
  EducationHistoryDialogUser,
} from "./components/EducationHistoryDialog/types";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

export const getEducationStatusStyles = (status: number) => {
  switch (status) {
    case 0:
      return {
        button: "bg-blue-100",
        text: "text-blue-600",
      };
    case 1:
      return {
        button: "bg-green-100",
        text: "text-green-700",
      };
    case 2:
      return {
        button: "bg-red-100",
        text: "text-red-700",
      };
    case 3:
      return {
        button: "bg-gray-100",
        text: "text-gray-700",
      };
    default:
      return {
        button: "bg-gray-200",
        text: "text-gray-500",
      };
  }
};

export const getEducationStatusLabelText = (
  status: number,
  settingsData?: string,
) => {
  if (status === 0 && settingsData !== "smart") {
    return "education_management_action_submitted";
  } else if (status === 0 && settingsData === "smart") {
    return "education_management_action_in_progress";
  }

  switch (status) {
    case 2:
      return "education_management_action_denied";
    case 1:
      return "education_management_action_approved";
    case 3:
      return "education_management_action_not_submitted";
    default:
      return "education_management_action_not_submitted";
  }
};

function EducationManagementPage() {
  const { text } = useLocale();
  const [resetEducationLoading, setResetEducationLoading] = useState(false);
  const [approveEducationLoading, setApproveEducationLoading] = useState(false);
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmail, setShowEmail] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<
    EducationHistoryDialogUser | undefined
  >(undefined);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const educationResetDialogRef = useRef<EducationResetDialogRef>(null);
  const educationCronDialogRef = useRef<EducationCronDialogRef>(null);
  const educationHistoryDialogRef = useRef<EducationHistoryDialogRef>(null);

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const { confirmDialog } = useDialog();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const {
    data: educationData,
    isFetching: educationFetching,
    isLoading: educationLoading,
  } = useGetUserEducation({
    limit: limit,
    page: page,
    ...(dataFilter?.searchKey && { searchKey: dataFilter?.searchKey }),
    ...(dataFilter?.startDate && { from_date: dataFilter?.startDate }),
    ...(dataFilter?.endDate && { to_date: dataFilter?.endDate }),
    ...(statusFilter !== "all" && {
      super_save_education_status: statusFilter,
    }),
  });

  const {
    data: settingsData,
  } = useGetSettings();
  const approvalValue = settingsData?.find(
    (item) => item.key === "EDUCATION_APPROVAL",
  )?.value;
  const { mutateAsync: updateEducationUserApi } = useUpdateUserEducation();
  const { mutateAsync: resetEducationManualApi } = useResetEducationManual();
  const { mutateAsync: approveEducationAllApi } = useApproveEducationAll();

  const handleOnChangeStatus = useCallback(
    (newEducationId: string, newEducationStatus: boolean) => {
      const nStatus = newEducationStatus ? 1 : 2;
      updateEducationUserApi(
        { education_id: newEducationId, status: nStatus },
        {
          onSuccess: () => {
            toast.success(text("education_management_status_update_success"));
          },
        },
      ).catch((error) => {
        toast.error(
          error.response?.educationData?.result ||
            text("education_management_status_update_failed"),
        );
      });
    },
    [text, updateEducationUserApi],
  );

  const handleViewHistory = useCallback(
    (user_id: string, user_email: string) => {
      educationHistoryDialogRef.current?.open();
      setSelectedUserForHistory({
        user_email,
        user_id,
      });
    },
    [],
  );

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "id",
        headerName: text("education_management_no"),
        minWidth: 50,
        width: 50,
        valueGetter: (params) => {
          return (page - 1) * limit + params.row.id;
        },
        type: "number",
      },
      {
        ...sharedColDef,
        field: "userName",
        headerName: `${text("education_management_education_name")}`,
        minWidth: 200,
        renderCell: ({ value }) => {
          return (
            <div className="flex w-full items-center justify-between">
              <Tooltip title={value?.name}>
              <span className="pl-2 truncate w-min ">{value?.name}</span>
              </Tooltip>
              <Link
                target="_blank"
                href={`/users/user-details?email=${value?.email}`}
                className="min-w-4"
              >
                <Image
                  className="cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </div>
          );
        },
        valueGetter: (params) => {
          const { name, email } = params.row.user;
          return { name, email };
        },
        sortComparator: (v1, v2) => {
          const name1 = v1.name.toLowerCase();
          const name2 = v2.name.toLowerCase();
          return name1.localeCompare(name2);
        },
      },
      {
        ...sharedColDef,
        field: "userEmail",
        headerName: `${text("education_management_education_email")}`,
        minWidth: 150,
        filterable: showEmail,
        sortable: showEmail,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {!showEmail && "invisible" ? "*****@*****" : value}
            </span>
            <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
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
        valueGetter: (params) => params.row.user?.email,
      },
      {
        ...sharedColDef,
        field: "userPhone",
        headerName: `${text("education_management_education_phone")}`,
        minWidth: 150,
        renderCell: ({ value }) => {
          return (
            <div className="flex items-center">
              <span className="pl-2">{value}</span>
            </div>
          );
        },
        valueGetter: (params) => params.row.user?.phone,
      },
      {
        ...sharedColDef,
        field: "education",
        headerName: `${text("education_management_education")}`,
        minWidth: 100,
        renderCell: ({ row }) => {
          const initialEnabled = row.education?.status === 1;
          return (
            <div>
              <EducationSwitch
                initialValue={initialEnabled}
                onChange={(newStatus) =>
                  handleOnChangeStatus(row.education?.uuid, newStatus)
                }
              />
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "education_round",
        headerName: `${text("education_management_round")}`,
        minWidth: 150,
        renderCell: ({ value }) => {
          return (
            <div className="flex items-center">
              <span className="pl-2">{value || 1}</span>
            </div>
          );
        },
        valueGetter: (params) => params.row.education?.education_round,
      },
      {
        ...sharedColDef,
        field: "education_date",
        headerName: text(
          "education_management_education_column_education_date",
        ),
        minWidth: 150,
        width: 150,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD HH:mm" />
            </p>
          ) : (
            <p className="truncate">N/A</p>
          ),
        valueGetter: (params) => params.row.education?.education_date,
      },
      {
        ...sharedColDef,
        field: "photo",
        headerName: text("education_management_photo"),
        minWidth: 100,
        width: 100,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) =>
            <button
              className={`flex items-center text-xs px-2 h-6 rounded-md ${
                row.education?.file ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
              }`}
              onClick={() => {
                if(row.education?.file){
                  setModalFileUrl(row.education.file);
                  viewFilesModal.current?.open();
                }
              }}
              id={`${htmlIds.btn_news_report_view_report}${row.no}`}
              disabled={!row.education?.file}
            >
              {text("education_management_page_column_view")}
            </button>
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: text("education_management_updated_date"),
        minWidth: 160,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD HH:mm:ss" />
            </p>
          ) : (
            <p className="truncate">N/A</p>
          ),
        valueGetter: (params) => params.row.user?.updatedAt,
      },
      {
        ...sharedColDef,
        field: "completed_date",
        headerName: text("education_management_completed_date"),
        minWidth: 150,
        width: 150,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD HH:mm" />
            </p>
          ) : (
            <p className="truncate">N/A</p>
          ),
        valueGetter: (params) => params.row.education?.completed_date,
      },
      {
        ...sharedColDef,
        field: "disabled_date",
        headerName: text("education_management_disabled_date"),
        minWidth: 150,
        width: 150,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD HH:mm" />
            </p>
          ) : (
            <p className="truncate">N/A</p>
          ),
        valueGetter: (params) => params.row.education?.disabled_date,
      },
      {
        ...sharedColDef,
        field: "submitted_date",
        headerName: text("education_management_submitted_date"),
        minWidth: 150,
        width: 150,
        type: "date",
        renderCell: ({ value }) => {
          return value ? (
            <p className="truncate">
              <DateFormatter value={value} format="YYYY-MM-DD HH:mm" />
            </p>
          ) : (
            <p className="truncate">N/A</p>
          );
        },
        valueGetter: (params) => params.row.education?.submitted_date,
      },
      {
        ...sharedColDef,
        field: "location",
        headerName: text("education_management_submitted_location"),
        minWidth: 150,
        width: 150,
        renderCell: ({ value }) => {
          if (!value) {
            return <p className="truncate">N/A</p>;
          }

          const [lat, lng] = value.split(", ");
          const language = "ko";
          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=${language}`;

          return (
            <div className="flex items-center">
                <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                    {value}
                </Link>
            </div>
          );
        },
        valueGetter: (params) => {
            const location = params.row.education?.location;
            if (location && location.lat && location.lng) {
                return `${location.lat}, ${location.lng}`;
            }
            return null;
        },
      },
      {
        ...sharedColDef,
        field: "community",
        headerName: text("community"),
        minWidth: 150,
        width: 150,
        renderCell: ({ value }) => {
          return value ? (
            <p className="truncate">{value}</p>
          ) : (
            <p className="truncate">N/A</p>
          );
        },
        valueGetter: (params) => params.row.education?.community,
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("education_management_status"),
        minWidth: 180,
        width: 180,
        renderCell: ({ value }) => {
          const rowStatus = value;
          const { button, text: textStyle } =
            getEducationStatusStyles(rowStatus);
          return (
            <button
              onClick={() => {}}
              className={`w-full flex items-center justify-center text-xs px-2 h-8 text-white rounded-md ${button}`}
            >
              <span className={textStyle}>
                {text(getEducationStatusLabelText(rowStatus, approvalValue))}
                {approvalValue === "smart" && rowStatus === 0 ? (
                  <Tooltip
                    placement="top"
                    title={
                      <p>
                        {text("education_management_action_status")}
                        <br />
                        {text("education_management_action_estimation")}
                      </p>
                    }
                    className="ml-1"
                  >
                    <InfoOutlined fontSize="small" />
                  </Tooltip>
                ) : (
                  ""
                )}
              </span>
            </button>
          );
        },
        valueGetter: (params) => params.row.education?.status,
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("deposit_information_column_manager"),
        minWidth: 180,
        width: 180,
        renderCell: ({ value }) => {
          return (
            <div className="flex items-center truncate">
              <Tooltip title={value}>
                <span>{value}</span>
              </Tooltip>
            </div>
          );
        },
        valueGetter: (params) => params.row.education?.action_by,
      },
      {
        ...sharedColDef,
        field: "action_history",
        headerName: text("education_management_actions"),
        minWidth: 160,
        width: 160,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <div className="flex items-center">
              <Button
                onClick={() => handleViewHistory(row.user?.id, row.user?.email)}
                variant="outlined"
                startIcon={<VisibilityOutlinedIcon />}
              >
                {text("education_management_actions_view_history_text")}
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      text,
      page,
      limit,
      showEmail,
      handleOnChangeStatus,
      handleViewHistory,
      approvalValue,
    ],
  );

  const handleReset = () => {
    educationResetDialogRef.current?.open();
  };

  const handleOnResetEducation = async (
    submitData: IEducationResetDialogSubmitData,
  ) => {
    try {
      confirmDialog({
        title: text("education_management_reset_confirm_title"),
        content: text("education_management_reset_confirm_content"),
        onOk: async () => {
          setResetEducationLoading(true);
          await resetEducationManualApi(
            {
              date: submitData.date,
            },
            {
              onSuccess: () => {
                toast.success(text("education_management_reset_success"));
                setResetEducationLoading(false);
              },
              onError: () => {
                toast.error(text("education_management_reset_failed"));
                setResetEducationLoading(false);
              },
            },
          );
        },
      });
    } catch (error) {
      toast.error(text("education_management_reset_failed"));
      setResetEducationLoading(false);
    }
  };

  const handleOnCronSettings = () => {
    educationCronDialogRef.current?.open();
  };

  const handleApprove = () => {
    confirmDialog({
      title: text("education_management_approve_confirm_title"),
      content: text("education_management_approve_confirm_content"),
      onOk: async () => {
        setApproveEducationLoading(true);
        approveEducationAllApi(null, {
          onSuccess: () => {
            toast.success(text("education_management_approve_success"));
            setApproveEducationLoading(false);
          },
          onError: () => {
            toast.error(text("education_management_approve_failed"));
            setApproveEducationLoading(false);
          },
        }).catch(() => {
          toast.error(text("education_management_approve_failed"));
          setApproveEducationLoading(false);
        });
      },
    });
  };

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("educationManagementState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setDataFilter(e);
  }, []);

  const statusFilterOptions = [0, 1, 2, 3].map((_status) => ({
    label: text(getEducationStatusLabelText(_status)),
    value: _status,
    className: getEducationStatusStyles(_status).text,
  }));

  const totalPages = educationData?.nbTotalElements
    ? Math.ceil(educationData?.nbTotalElements / limit)
    : 0;
  const rows = (educationData?.dataList || []).map((item, index) => ({
    id: index + 1,
    ...item,
  }));

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter, statusFilter]);

  return (
    <div className="h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("education_management_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("education_management_sub_text")}
        </span>
      </div>

      <div>
        <div className="flex flex-wrap gap-1 border-b pb-3 justify-end xxl:justify-start">
          <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

          <div>
            <DynamicStatusFilter
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
              }}
              options={statusFilterOptions}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-center pt-4">
          <div className={"flex justify-between items-center"}>
            {Object.keys(columnCurrentState).length > 0 && (
              <div className="flex">
                <SaveNResetButtons
                  saveHandler={() => setOpenConfirmDialog(true)}
                  resetHandler={handleResetDefault}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap md:flex-row gap-2 justify-end items-center py-3">
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
            <button
              id={htmlIds.btn_bug_report_save_request}
              onClick={handleOnCronSettings}
              disabled={approveEducationLoading}
              className={`flex items-center justify-center text-sm px-4 h-10 disabled:bg-transparent disabled:text-neutral-100 disabled:cursor-not-allowed border border-gray-400 text-black rounded-md  ${
                approveEducationLoading ? "disabled:border-gray-300" : ""
              }`}
            >
              <span>
                {text("education_management_action_cron_settings_button")}
              </span>
            </button>
            <button
              id={htmlIds.btn_bug_report_save_request}
              onClick={handleApprove}
              disabled={approveEducationLoading}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md "
            >
              {approveEducationLoading && <Spinner />}
              <span>{text("education_management_action_approve_button")}</span>
            </button>
            <button
              id={htmlIds.btn_bug_report_save_request}
              onClick={handleReset}
              disabled={resetEducationLoading}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-500 text-white rounded-md "
            >
              {resetEducationLoading && <Spinner />}
              <span>{text("education_management_action_reset_button")}</span>
            </button>
          </div>
        </div>

        <div className="w-full mt-2 bg-white tableContainer pb-10">
          <DataGridPro
            getRowId={(row) => row?.user?.id}
            rows={rows}
            columns={columns}
            loading={educationFetching}
            disableSelectionOnClick
            sx={customisedTableClasses}
            hideFooter
            // checkboxSelection
            selectionModel={rowSelectionModel}
            onSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel);
            }}
            isRowSelectable={(row) => !row.row?.is_paid}
            autoHeight={!false}
            paginationMode="server"
            rowCount={0}
            apiRef={apiRef}
            onColumnOrderChange={() => handleColumnChange(false)}
            onSortModelChange={() => handleColumnChange(true)}
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
          />
          <Pagination
            limits={[25, 50, 75, 100]}
            limit={limit}
            onChangeLimit={setLimit}
            page={page}
            onChangePage={setPage}
            totalPages={totalPages}
            isFetching={educationLoading}
          />
        </div>
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <ViewFilesModal
        ref={viewFilesModal}
        files={[{ file_name: "education_images", file_url: modalFileUrl }]}
      />
      <EducationResetDialog
        ref={educationResetDialogRef}
        onClose={console.log}
        onOk={handleOnResetEducation}
      />
      <EducationCronDialog
        ref={educationCronDialogRef}
        onOk={async () => {
          console.log("onOk");
        }}
      />
      <EducationHistoryDialog
        user={selectedUserForHistory}
        ref={educationHistoryDialogRef}
        onClose={() => setSelectedUserForHistory(undefined)}
      />
    </div>
  );
}

export default EducationManagementPage;
