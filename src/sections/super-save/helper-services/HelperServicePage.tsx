import { htmlIds } from "@cypress/utils/ids";
import { Select, MenuItem, ListItemText, Box, IconButton } from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HelperMemoEditModal } from "./components";
import { DataFilterType, DateFormatter, ShowEmail } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import {
  useGetHelperServices,
  useDeleteHelperService,
  useEditHelperService,
  IHelperService,
} from "api/hooks";
import { AllLocalKeys, LocalKeys, useLocale } from "locale";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import Image from "next/image";
import { toast } from "react-toastify";
import { queryClient } from "api";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

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
  waiting: "super_save_helper_services_waiting_status_suffix",
  completed: "super_save_helper_services_completed_status_suffix",
  hold: "super_save_helper_services_hold_status_suffix",
};

function HelperServicesScreen() {
  const { text } = useLocale();
  const { alertDialog, confirmDialog } = useDialog();

  const [showEmail, setShowEmail] = useState(false);

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [editId, setEditId] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [status, setStatus] = useState("unselected");
  const [lastId, setLastId] = useState<string>();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [helperServices, setHelperServices] = useState<IHelperService[]>([]);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const handleModalClose = React.useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalSubmit = () => {
    if (lastId !== undefined) {
      setLastId(undefined);
    } else {
      queryClient.invalidateQueries("helper-services");
    }
    document
      ?.querySelector?.(".MuiDataGrid-virtualScroller")
      ?.scrollTo?.({ top: 0 });
  };

  const { data, isFetching } = useGetHelperServices(
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
        setHelperServices((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.help_requests,
        ]);
      },
    },
  );
  const { mutateAsync: deleteHelper } = useDeleteHelperService();
  const { mutateAsync: editHelper } = useEditHelperService();

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
        field: "no",
        headerName: text("super_save_helper_services_no_column_title"),
        minWidth: 80,
        disableReorder: true,
        typw: "number",
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
        renderCell: ({ value }) => value || "---",
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
        field: "edit_actions",
        headerName: text("reserved_vault_column_header_actions"),
        minWidth: 150,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <p
              id={htmlIds.btn_helper_service_add_memo + row.no}
              onClick={() => {
                setEditId(row.id);
                setEditMemo(row.memo);
                setModalOpen(true);
              }}
              className="underline cursor-pointer"
            >
              {text(
                row.memo
                  ? "reserved_vault_column_header_view_memo_action"
                  : "reserved_vault_column_header_add_memo_action",
              )}
            </p>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const serviceCount = rowSelectionModel.length;
  const isSingleService = serviceCount === 1;
  const serviceLabel = isSingleService ? "super_save_helper_service" : "super_save_helper_services";
  const serviceSelectionText = isSingleService ? "super_save_helper_services_single_service_selected" : "super_save_helper_services_multiple_service_selected";

  const handleDelete = () => {

    const title = `${text("modal_form_delete_sub_title")}  ${rowSelectionModel.length} ${text("deposit_information_status_selected")}`;

     const content = `${text("popup_form_warning_msg")} ${
       rowSelectionModel.length > 1
         ? text("helper_service_page_modal_delete_confirmation_multiple")
         : text("helper_service_page_modal_delete_confirmation_single")
     } ${text("withdrawal_information_form_info_msg")}?`;

    confirmDialog({
     title,
     content,
      onOk: async () => {
        try {
          const idList = rowSelectionModel as string[];

          await deleteHelper({ id: idList });
          toast.success(text("super_save_helper_services_status_deleted"));
          setRowSelectionModel([]);
          handleModalSubmit();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(error?.response?.data?.result || text("toast_error_something_went_wrong_try_again"));
        }
      },
    });
  };

  const handleSave = () => {
    /*Filter selection whose status is same will be ignore*/
    const filteredSelection = helperServices.filter(
      (service) => rowSelectionModel.includes(service.id) && service.status !== status
    ).map(service => service.id);

    if (filteredSelection.length === 0 && status) {
      alertDialog({
        title: text("super_save_helper_services_status_warning"),
      });
      return;
    }

    const returnStatusSuffix = text(statusSuffixMap[status as Status] as AllLocalKeys);
    setRowSelectionModel(filteredSelection);
    confirmDialog({
      title: `${text("super_save_helper_services_update")} ${isSingleService ? "" : filteredSelection.length} ${text(serviceLabel)}${returnStatusSuffix}?`,
      content: `${text("super_save_helper_services_update_warning_msg")} ${text(serviceSelectionText)}${returnStatusSuffix.toLowerCase()}?`,
      onOk: async () => {
        try {
          await Promise.all(
            filteredSelection.map(
              async (serviceId) => await editHelper({ id: serviceId as string, status })
            ),
          );
          toast.success(text("super_save_helper_services_status_update"));
          setRowSelectionModel([]);
          setStatus("unselected");
          handleModalSubmit();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(error?.response?.data?.result || text("toast_error_something_went_wrong_try_again"));
        }
      },
    });
  };

  const helpServicesWithIndex = useMemo(
    () =>
      helperServices.map((item, index) => ({ ...item, no: index + 1 })) || [],
    [helperServices],
  );

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
    if (helperServices?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [helperServices?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = React.useCallback((e: DataFilterType) => {
    setDataFilter(e);
    setLastId(undefined);
  }, []);

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
  } = useGridColumnChange("helperServiceColumnState");

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
          {text("super_save_helper_services_page_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("super_save_helper_services_page_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex  flex-wrap justify-between">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-1 items-center py-3">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
          <div className="flex flex-wrap justify-end items-center gap-2">
            <p className="text-neutral-500">{`${rowSelectionModel.length} selected`}</p>
            <Select
              id={htmlIds.select_helper_service_select_status}
              className="bg-gray-50  h-11 w-60 text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600"
              inputProps={{ "aria-label": "Without label" }}
              MenuProps={MenuProps}
              defaultValue={status}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              id={htmlIds.btn_helper_service_save_request}
              disabled={!rowSelectionModel.length || status === "unselected"}
              onClick={handleSave}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
            >
              <span>{text("withdrawal_information_save_title")}</span>
            </button>
            <button
              id={htmlIds.btn_helper_service_delete_request}
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
        id={htmlIds.div_helper_service_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.id}
          rows={helpServicesWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={helpServicesWithIndex.length}
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
      <HelperMemoEditModal
        open={modalOpen}
        handleClose={handleModalClose}
        handleSubmit={handleModalSubmit}
        id={editId}
        memo={editMemo}
        title={
          editMemo !== ""
            ? text("edit_memo_vault_title")
            : text("add_memo_vault_title")
        }
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default HelperServicesScreen;
