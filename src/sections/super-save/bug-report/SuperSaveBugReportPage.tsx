import { DataFilterType, DateFormatter, ShowEmail } from "@common/components";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import { Box, IconButton, ListItemText, MenuItem, Select } from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import {
  IBugReport,
  useDeleteBugReport,
  useEditBugReportStatus,
  useGetBugReports,
  usePostEmailBugReportUser,
} from "api/hooks";
import { AllLocalKeys, LocalKeys, useLocale } from "locale";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  BugReportSaveModal,
  ViewBugReportModal,
  ViewBugReportModalRef,
} from "./components";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

const CHANGE_STATUSES = [
  { label: "super_save_helper_services_waiting", value: "waiting" },
  { label: "super_save_helper_services_completed", value: "completed" },
  { label: "super_save_helper_services_hold", value: "hold" },
];

type Status = "waiting" | "completed" | "hold";
const statusSuffixMap = {
  waiting: "super_save_bug_reports_waiting_status_suffix",
  completed: "super_save_bug_reports_completed_status_suffix",
  hold: "super_save_bug_reports_hold_status_suffix",
};

function BugReportScreen() {

  const viewBugReportModal = useRef<ViewBugReportModalRef>(null);
  const { text } = useLocale();
  const { alertDialog, confirmDialog } = useDialog();

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [editReport, setEditReport] = useState({ content: "", image: "" });
  const [status, setStatus] = useState("unselected");
  const [lastId, setLastId] = useState<string>();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [bugReports, setBugReports] = useState<IBugReport[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [openBugReportSaveModal, setOpenBugReportSaveModal] = useState(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data, isFetching, refetch } = useGetBugReports(
    {
      limit: 25,
      lastId,
      searchKey:
        (dataFilter?.searchKey?.length || 0) > 0
          ? dataFilter?.searchKey
          : undefined,
      startDate: dataFilter?.startDate,
      endDate: dataFilter?.endDate,
    },
    {
      onSuccess: (data) => {
        setBugReports((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.bug_reports,
        ]);
      },
    },
  );

  const { mutateAsync: editBugReportStatus, isLoading: isEditBugReportStatus } =
    useEditBugReportStatus();
  const { mutateAsync: deleteBugReport } = useDeleteBugReport();
  const {
    mutateAsync: postEmailBugReportUser,
    isLoading: isPostEmailBugReportUserLoading,
  } = usePostEmailBugReportUser();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("super_save_helper_services_no_column_title"),
        minWidth: 80,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("super_save_helper_services_name_column_title"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "phone_number",
        headerName: text("super_save_helper_services_phone_column_title"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "email",
        headerName: text("super_save_helper_services_email_column_title"),
        minWidth: 250,
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
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("super_save_helper_services_date_column_title"),
        minWidth: 200,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: text("super_save_helper_services_status_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => {
          switch (value) {
            case "waiting":
              return (
                <p className="text-blue-400">
                  {text("super_save_helper_services_waiting")}
                </p>
              );
            case "completed":
              return (
                <p className="text-green-400">
                  {text("super_save_helper_services_completed")}
                </p>
              );
            case "hold":
              return <p>{text("super_save_helper_services_hold")}</p>;
            default:
              break;
          }
        },
      },
      {
        ...sharedColDef,
        field: "image",
        headerName: text("reserved_vault_column_header_actions"),
        minWidth: 150,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <p
              onClick={() => {
                setEditReport({ content: row.content, image: row.image });
                viewBugReportModal.current?.open();
              }}
              className="underline cursor-pointer"
              id={`${htmlIds.btn_bug_report_view_report}${row.no}`}
            >
              {text("super_save_bug_report_view_report")}
            </p>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const reportsCount = rowSelectionModel.length;
  const isSingleReport = reportsCount === 1;
  const reportLabel = isSingleReport ? "super_save_bug_report" : "super_save_bug_reports";
  const reportSelectionText = isSingleReport ? "super_save_bug_reports_single_report_selected" : "super_save_bug_reports_multiple_reports_selected";

  const handleDelete = () => {

 const title = `${text("modal_form_delete_sub_title")} ${
   reportsCount > 1
     ? `${rowSelectionModel.length} ${text(
         "deposit_information_status_selected",
       )}`
     : `${text(reportLabel)}?`
 }`;

 const content = `${text("popup_form_warning_msg")} ${
   rowSelectionModel.length > 1
     ? text("bug_report_page_modal_delete_confirmation_multiple")
     : text("bug_report_page_modal_delete_confirmation_single")
 } ${text("withdrawal_information_form_info_msg")}?`;

    confirmDialog({
      title,
      content,
      onOk: async () => {
        try {
          const id_list = rowSelectionModel as string[];

          await deleteBugReport({ id: id_list });
          toast.success(text("super_save_bug_reports_status_deleted"));
          setRowSelectionModel([]);
          if (lastId !== undefined) {
            setLastId(undefined);
          } else {
            refetch();
          }
          document
            ?.querySelector?.(".MuiDataGrid-virtualScroller")
            ?.scrollTo?.({ top: 0 });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(error?.response?.data?.result || text("toast_error_something_went_wrong_try_again"));
        }
      },
    });
  };

  const handleModalClose = useCallback(() => {
    setOpenBugReportSaveModal(false);
  }, []);

  const handleOnReportModalOk = async (arrIds: GridSelectionModel, emailBody?: string) => {
    try {
      if (emailBody === "" && status === "completed") return;
      if (emailBody) {
        const promises = arrIds.map((id) =>
          postEmailBugReportUser({
            bug_report_id: id as string,
            message: emailBody,
            subject: "Bug Report Reply",
          }).then(() => editBugReportStatus({ id: id as string, status }))
        );
        await Promise.all(promises);
      } else {
        const promises = arrIds.map((id) =>
          editBugReportStatus({ id: id as string, status })
        );
        await Promise.all(promises);
      }
      toast.success(text("super_save_helper_services_status_update"));

      setRowSelectionModel([]);
      setStatus("unselected");
      if (lastId !== undefined) {
        setLastId(undefined);
      } else {
        refetch();
      }
      document
        ?.querySelector?.(".MuiDataGrid-virtualScroller")
        ?.scrollTo?.({ top: 0 });

      setOpenBugReportSaveModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.result || text("toast_error_something_went_wrong_try_again"));
    }
  };

  const handleSave = () => {
    if (!status) {
      alertDialog({
        title: text("super_save_helper_services_status_validate"),
      });
      return;
    }

    // Check if status is the same
    const filteredArrays = bugReports.filter((itm) =>
      rowSelectionModel.includes(itm.id),
    );
    const arrIds = filteredArrays
      .filter((itm) => itm.status !== status)
      .map((it) => it.id);

    if (!arrIds.length) {
      alertDialog({
        title: text("super_save_bug_report_same_status"),
      });
    } else {
      setRowSelectionModel(arrIds);
      if (arrIds.length > 1 || status !== "completed") {
        const returnStatusSuffix = text(statusSuffixMap[status as Status] as AllLocalKeys);
        confirmDialog({
          title: `${text("super_save_bug_reports_update")} ${isSingleReport ? "" : arrIds.length} ${text(reportLabel)}${returnStatusSuffix}?`,
          content: `${text("super_save_bug_reports_update_warning_msg")} ${text(reportSelectionText)}${returnStatusSuffix.toLowerCase()}?`,
          onOk: async () => await handleOnReportModalOk(arrIds),
        });
      } else {
        setOpenBugReportSaveModal(true);
      }
    }
  };

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
    if (bugReports?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [bugReports?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setDataFilter(e);
  }, []);

  const bugReportWithIndex = useMemo(
    () => bugReports.map((item, index) => ({ ...item, no: index + 1 })),
    [bugReports],
  );

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
  } = useGridColumnChange("bugReportColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("super_save_bug_report_page_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("super_save_bug_report_page_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex flex-wrap mt-2 justify-between">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex gap-1 justify-between items-center py-3  flex-wrap flex-grow">
          <div className="flex flex-wrap">
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
          </div>
          <div className="flex flex-wrap  justify-start sm:justify-end items-center gap-2">
            <p className="text-neutral-500">{`${rowSelectionModel.length} selected`}</p>
            <Select
              id={htmlIds.select_bug_report_select_status}
              className="bg-gray-50  h-11 w-60 text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600"
              inputProps={{ "aria-label": "Without label" }}
              MenuProps={MenuProps}
              defaultValue={status}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
              disabled={!rowSelectionModel.length}
            >
              <MenuItem disabled value="unselected">
                <em>{text("super_save_helper_services_change_status")}</em>
              </MenuItem>
              {CHANGE_STATUSES.map((item) => {
                return (
                  <MenuItem
                    className="text-xs text-neutral-500"
                    key={item.value}
                    value={item.value}
                  >
                    <ListItemText
                      className="text-xs"
                      primary={text(item.label as LocalKeys)}
                    />
                  </MenuItem>
                );
              })}
            </Select>
            <button
              id={htmlIds.btn_bug_report_save_request}
              disabled={!rowSelectionModel.length || status === "unselected"}
              onClick={handleSave}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
            >
              <span>{text("withdrawal_information_save_title")}</span>
            </button>
            <button
              id={htmlIds.btn_bug_report_delete_request}
              disabled={!rowSelectionModel.length}
              onClick={handleDelete}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-500 text-white rounded-md"
            >
              <span>{text("super_save_bug_report_modal_delete")}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={htmlIds.div_bug_report_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.id}
          rows={bugReportWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={bugReportWithIndex.length}
          checkboxSelection
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
      <ViewBugReportModal ref={viewBugReportModal} report={editReport} />
      <BugReportSaveModal
        open={openBugReportSaveModal}
        onOk={async (email) => await handleOnReportModalOk(rowSelectionModel, email)}
        onCancel={handleModalClose}
        isSubmitting={isPostEmailBugReportUserLoading || isEditBugReportStatus}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default BugReportScreen;
