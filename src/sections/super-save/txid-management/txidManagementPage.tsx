import { DataFilterType, DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import {
  resetMUIToolbarFilter,
  scrollToTop
} from "@common/utils/helpers";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel
} from "@mui/x-data-grid-pro";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useDialog } from "@common/context";
import { toast } from "react-toastify";
import { LocalKeys } from "locale";
import {
  Select,
  MenuItem,
  ListItemText,
  Chip,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import { htmlIds } from "@cypress/utils/ids";
import {
  useGetTxIdHistory,
  useUpdateTxidHistory,
  useAddNewTXID,
  useEditTXID,
  useDeleteTxid,
} from "api/hooks";
import { ITxidHistory } from "api/hooks/txid-history/types";
import {
  ITxidUpdateSubmitData,
  TxidUpdateModal,
} from "./components/TxidUpdateModal";
import TxidStatusFilter from "@common/components/TxidStatusFilter";
import Image from "next/image";
import Link from "next/link";
import TXIDModal from "./components/TXIDModal";
import { ITxidDataObject } from "./components/TxidUpdateModal/types";
import { TxidDeleteModal } from "./components/TxidDeleteModal";
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
  { label: "txid_management_status_option_waiting_return", value: 0 },
  { label: "txid_management_status_option_rejected", value: 2 },
];

function TxidManagementPage() {
  const { text } = useLocale();
  const [lastId, setLastId] = useState<string>();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [status, setStatus] = useState("unselected");
  const [statusFilter, setStatusFilter] = useState("all");
  const [txidManagement, setTxidManagement] = useState<ITxidHistory[]>([]);
  const [visibleTxidUpdateModal, setVisibleTxidUpdateModal] = useState(false);
  const [selectedTxidToUpdate, setSelectedTxidToUpdate] =
    useState<ITxidHistory | null>(null);
  const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);
  const [visibleTxidDeleteModal, setVisibleTxidDeleteModal] = useState(false);
  const [selectedTxidToDelete, setSelectedTxidToDelete] = useState<
    string | null
  >(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState<boolean>(false);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [addNewModalOpen, setAddNewModalOpen] = useState<boolean>(false);
  const [isAddNewSubmitting, setIsAddNewSubmitting] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [addNewTXIDData, setAddNewTXIDData] = useState<ITxidDataObject[]>([
    { key: "txid", value: "", required: true, error: null, disable: false },
    {
      key: "super_save_request_id",
      value: "",
      required: false,
      error: null,
      disable: false,
    },
    { key: "token", value: "", required: false, error: null, disable: false },
    { key: "amount", value: "", required: false, error: null, disable: false },
    { key: "reason", value: "", required: false, error: null, disable: false },
  ]);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);


  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetTxIdHistory(
    {
      limit: 25,
      lastId,
      ...(dataFilter?.searchKey && { searchKey: dataFilter?.searchKey }),
      ...(dataFilter?.startDate && { date_from: dataFilter?.startDate }),
      ...(dataFilter?.endDate && { date_to: dataFilter?.endDate }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    },
    {
      onSuccess: (data) => {
        if (lastId !== undefined) {
          setTxidManagement((prev) => [...prev, ...data.rows]);
        } else {
          setTxidManagement(data.rows);
        }
      },
    },
  );

  const { mutateAsync: updateTxidHistoryApi } = useUpdateTxidHistory();
  const { mutateAsync: editTXID } = useEditTXID();
  const { mutateAsync: addNewTXID } = useAddNewTXID();
  const { mutateAsync: deleteTxid } = useDeleteTxid();

  const txidManagementWithIndex = useMemo(() => {
    return txidManagement.map((item, index) => {
      return {
        ...item,
        id: index + 1,
      };
    });
  }, [txidManagement]);

  const { alertDialog, confirmDialog } = useDialog();

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
    if (txidManagement?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [txidManagement?.length, data?.hasNext, data?.lastId]);

  const copyToClipboard = useCallback(
    (textToCopy: string) => {
      navigator?.clipboard.writeText(textToCopy);
      toast(text("add_platform_copied_to_clipboard"), {
        type: "success",
      });
    },
    [text],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "id",
        headerName: text("txid_management_no"),
        minWidth: 50,
        width: 50,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "txid",
        headerName: text("txid_management_TXID"),
        minWidth: 200,
        width: 200,
        renderCell: ({ value }) => {
          return (
            <div className="w-full flex justify-between items-center">
              <span className="w-fit truncate">
                <Link
                  target="_blank"
                  href={`https://polygonscan.com/tx/${value}`}                  
                >
                  {value}
                </Link>
              </span>
              {value && (
                <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      className="cursor-pointer"
                      alt=""
                      width={17}
                      height={17}
                      src="/images/copy-icon.svg"
                    />
                  </Box>
                </IconButton>
              )}
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "super_save_request_id",
        headerName: text("txid_management_request_id"),
        minWidth: 200,
        width: 200,
        renderCell: ({ value }) => {
          return (
            <div className="w-full flex justify-between items-center">
              <span className="w-fit truncate">
                <Link
                  target="_blank"
                  href={`/super-save/deposit-information?searchKey=${value}`}
                >
                  {value}
                </Link>
              </span>
              {value && (
                <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      className="cursor-pointer"
                      alt=""
                      width={17}
                      height={17}
                      src="/images/copy-icon.svg"
                    />
                  </Box>
                </IconButton>
              )}
            </div>
          );
        },
      },

      {
        ...sharedColDef,
        field: "amount",
        headerName: text("txid_management_Amount"),
        minWidth: 100,
        width: 100,
        type: "number",
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "token",
        headerName: text("txid_management_Coin"),
        minWidth: 100,
        width: 100,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: text("txid_management_status"),
        minWidth: 150,
        width: 150,
        renderCell: ({ value, row }) => {
          const chipProps: {
            label: string;
            color: "warning" | "success" | "error";
          } = {
            label: text(
              value === 0
                ? "txid_management_status_option_waiting_return"
                : value === 1
                  ? "txid_management_status_option_coin_returned"
                  : value === 2
                    ? "txid_management_status_option_rejected"
                    : "txid_management_status_option_unknown",
            ),
            color: value === 0 ? "warning" : value === 1 ? "success" : "error",
          };

          return (
            <div className="flex items-center">
              {value === 1 ? (
                <Link
                  target="_blank"
                  href={`https://polygonscan.com/tx/${row.refund_txid}`}
                >
                  <Tooltip placement="top" title={row.refund_txid}>
                    <Chip {...chipProps} size="small" />
                  </Tooltip>
                </Link>
              ) : (
                <Chip {...chipProps} size="small" />
              )}
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "reason",
        headerName: text("txid_management_reason"),
        minWidth: 250,
        width: 250,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("txid_management_action"),
        minWidth: 220,
        width: 220,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => (
          <>
            <Tooltip
              placement="top"
              title={row.status === 1 ? row.updatedAt : ""}
            >
              <button
                onClick={() => {
                  if (row.status === 1) return;
                  setSelectedTxidToUpdate(row as ITxidHistory);
                  setVisibleTxidUpdateModal(true);
                }}
                className={`flex items-center text-xs px-2 h-6 text-white rounded-md bg-orange-500
                    ${row.status === 1
                    ? " opacity-20 cursor-not-allowed "
                    : "  "
                  }`}
              >
                <span>{text("txid_management_action_return")}</span>
              </button>
            </Tooltip>
            <div className="w-4" />
            <button
              onClick={() => handleEditTXID(row)}
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md bg-blue-500
                    ${row.status === 1 ? "opacity-20 cursor-not-allowed " : ""
                }`}
            >
              <span>{text("txid_management_action_edit")}</span>
            </button>
            <div className="w-4" />
            <button
              onClick={() => {
                if (row.status === 1) return;
                setSelectedTxidToDelete(row.txid);
                setVisibleTxidDeleteModal(true);
              }}
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md bg-red-600
                    ${row.status === 1
                  ? " opacity-20 cursor-not-allowed "
                  : "  "
                }`}
            >
              <span>{text("txid_management_deletion")}</span>
            </button>
          </>
        ),
      },
      {
        ...sharedColDef,
        field: "refund_reason",
        headerName: text("update_txid_modal_input_return_reason_title"),
        minWidth: 200,
        width: 200,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("txid_management_created_at"),
        type: "date",
        renderCell: ({ row }) => (
          <p className="truncate">
            <DateFormatter value={row.createdAt} breakLine />
          </p>
        ),
        minWidth: 200,
        width: 200,
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: text("txid_management_modified_at"),
        type: "date",
        renderCell: ({ row }) => (
          <p className="truncate">
            <DateFormatter value={row.updatedAt} breakLine />
          </p>
        ),
        minWidth: 200,
        width: 200,
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("deposit_information_column_manager"),
        minWidth: 100,
        width: 100,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [copyToClipboard, text],
  );

  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("TxidManagementState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setDataFilter(e);
    // setBugReports([]);
  }, []);

  const handleStatusFilterChange = useCallback((e: string) => {
    setLastId(undefined);
    setStatusFilter(e);
    scrollToTop();
  }, []);

  const handleSave = () => {
    const filteredArrays = txidManagement.filter((item) =>
      rowSelectionModel.includes(item.txid) && item.status !== Number(status),
    );
    const transactionsCount = filteredArrays.length;
    const isSingleTransaction = transactionsCount === 1;
    const transactionLabel = isSingleTransaction ? "txid_management_transaction" : "txid_management_transactions";

    const isRejected = Number(status) === 2;
    const statusText = isRejected ? "txid_management_transaction_reject" : "txid_management_transaction_update";
    const warningMsg = isRejected ? "txid_management_reject_warning_msg" : "txid_management_update_warning_msg";
    const returnStatusSuffix = isRejected ? "" : text("txid_management_return_status_suffix");
    const filteredIds = filteredArrays.map(item => item.txid);
    setRowSelectionModel(filteredIds);

    if (transactionsCount === 0 && status !== "") {
      alertDialog({
        title: text("txid_management_status_warning"),
      });
      setStatus("unselected");
      return;
    }

    confirmDialog({
      title: `${text(statusText)} ${isSingleTransaction ? "" : transactionsCount} ${text(transactionLabel)}${returnStatusSuffix}?`,
      content: `${text(warningMsg)} ${isSingleTransaction ? text("txid_management_single_transaction_selected") : text("txid_management_multiple_transactions_selected")}${returnStatusSuffix.toLowerCase()}?`,
      onOk: async () => {
        const updatePromises = filteredArrays.map((row) => {
          return updateTxidHistoryApi({
            createdAt: row.createdAt,
            refund_amount: row.refund_amount,
            refund_token: row.refund_token,
            refund_txid: row.refund_txid,
            refund_reason: row.refund_reason,
            txid: row.txid,
            status: Number(status),
          });
        });
        try {
          await Promise.all(updatePromises);
          setLastId(undefined);
          setRowSelectionModel([]);
          setStatus("unselected");
          scrollToTop();
          toast.success(text("txid_managment_status_updated_successfully"));
          lastId === undefined && refetch();
        } catch (e) {
          toast.error(text("toast_error_validation_error"));
        }
      },
    });
  };

  const handleOnUpdateTxid = (data: ITxidUpdateSubmitData) => {
    if (selectedTxidToUpdate) {
      setIsUpdateSubmitting(true);
      updateTxidHistoryApi(
        {
          createdAt: selectedTxidToUpdate.createdAt,
          refund_amount: Number(data.refund_amount),
          refund_token: data.refund_token,
          refund_txid: data.refund_txid,
          refund_reason: data.refund_reason,
          txid: selectedTxidToUpdate.txid,
          status: 1,
        },
        {
          onSuccess: () => {
            scrollToTop();
            setLastId(undefined);
            setVisibleTxidUpdateModal(false);
            setSelectedTxidToUpdate(null);
            setIsUpdateSubmitting(false);
            toast.success(text("txid_management_return_success"));
            lastId === undefined && refetch();
          },
        },
      ).catch((error) => {
        setIsUpdateSubmitting(false);
        toast.error(
          error?.response?.data?.message || error?.response?.data?.error
        );
      });
    }
  };

  const handleOnDeleteTxid = () => {
    setIsDeleteSubmitting(true);
    if (selectedTxidToDelete) {
      deleteTxid(
        {
          txid: selectedTxidToDelete,
        },
        {
          onSuccess: () => {
            setTxidManagement((prev) => [
              ...prev.filter((row) => row.txid !== selectedTxidToDelete),
            ]);
            setVisibleTxidDeleteModal(false);
            setLastId(undefined);
            setSelectedTxidToDelete(null);
            setIsDeleteSubmitting(false);
            scrollToTop();
            toast.success(text("delete_txid_return_success"));
            lastId === undefined && refetch();
          },
        },
      ).catch((error) => {
        setIsDeleteSubmitting(false);
        toast.error(
          error?.response?.data?.message || text("delete_txid_return_failure"),
        );
      });
    }
  };

  const initialTxidUpdateData: ITxidUpdateSubmitData | undefined =
    useMemo(() => {
      if (visibleTxidUpdateModal && selectedTxidToUpdate) {
        return {
          refund_token: "",
          refund_amount: "",
          refund_txid: "",
          refund_reason: "",
        };
      }
      return undefined;
    }, [visibleTxidUpdateModal, selectedTxidToUpdate]);

  const getNewTXIDData = () => {
    const formattedData = {} as { [key: string]: string | number };

    addNewTXIDData.forEach((item) => {
      if (item.key === "amount" && item.value === "") return;
      if (item.key === "token" && item.value === "") return;

      formattedData[item.key] =
        item.key === "amount" ? Number(item.value) : item.value;
    });
    return formattedData;
  };

  const handleAddNewTXID = (formClose: () => void) => {
    let isValid = true;

    addNewTXIDData.forEach((item) => {
      if (item.required && item.value.trim() === "") {
        isValid = false;
        setAddNewTXIDData((prevData) =>
          prevData.map((dataItem) => ({
            ...dataItem,
            error:
              dataItem.key === item.key
                ? text("txid_management_required_error")
                : dataItem.error,
          })),
        );
      }
    });

    if (!isValid) return;
    setIsAddNewSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = getNewTXIDData();

    if (isEditMode) {
      editTXID(data, {
        onSuccess: () => {
          handleAddNewTXIDClose();
          setLastId(undefined);
          formClose();
          scrollToTop();
          toast.success(text("txid_management_edit_success"));
          lastId === undefined && refetch();
        },
      }).catch((error) => handleAddTXIDCatch(error));
    } else {
      addNewTXID(data, {
        onSuccess: () => {
          handleAddNewTXIDClose();
          setLastId(undefined);
          formClose();
          scrollToTop();
          toast.success(text("txid_management_add_api_success"));
          lastId === undefined && refetch();
        },
      }).catch((error) => handleAddTXIDCatch(error));
    }
  };

  const handleAddNewTXIDClose = () => {
    const resetData = addNewTXIDData.map((item) => ({
      ...item,
      value: "",
      error: null,
    }));
    setAddNewTXIDData(resetData);
    setAddNewModalOpen(false);
    setIsAddNewSubmitting(false);
    setIsEditMode(false);
  };

  const handleEditTXID = (row: ITxidHistory) => {
    const {
      txid,
      token,
      reason,
      super_save_request_id,
      amount = "",
      status,
    } = row;
    if (status === 1) return;

    setAddNewTXIDData([
      {
        key: "txid",
        value: String(txid),
        required: true,
        error: null,
        disable: false,
      },
      {
        key: "super_save_request_id",
        value: String(super_save_request_id),
        required: false,
        error: null,
        disable: false,
      },
      {
        key: "token",
        value: String(token),
        required: false,
        error: null,
        disable: true,
      },
      {
        key: "amount",
        value: String(amount),
        required: false,
        error: null,
        disable: true,
      },
      {
        key: "reason",
        value: String(reason),
        required: false,
        error: null,
        disable: false,
      },
    ]);
    setIsEditMode(true);
    setAddNewModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddTXIDCatch = (error: any) => {
    setIsAddNewSubmitting(false);
    toast.error(
      error?.response?.data?.message || text("txid_management_add_api_error"),
    );
  };

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter, statusFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("admin_txid_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("admin_txid_subtitle")}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 border-b pb-3  justify-end xxl:justify-start">
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

        <div>
          <TxidStatusFilter value={statusFilter} onChange={handleStatusFilterChange} />
        </div>
      </div>

      <div className="flex flex-col flex-grow pt-3">
        <div className="flex flex-col md:flex-row justify-between">
          <div className={"flex items-center"}>
            {Object.keys(columnCurrentState).length > 0 && (
              <div className="flex">
                <SaveNResetButtons
                  saveHandler={() => setOpenConfirmDialog(true)}
                  resetHandler={handleResetDefault}
                />
              </div>
            )}
          </div>

          <div className="flex flex-row flex-wrap gap-2 justify-between md:justify-end items-end md:items-center pt-3 pb-2">
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            <button
              onClick={() => {
                const resetData = addNewTXIDData.map((item) => ({
                  ...item,
                  disable: false,
                }));
                setAddNewTXIDData(resetData);
                setAddNewModalOpen(true);
                setIsEditMode(false);
              }}
              className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
            >
              <span>{text("txid_management_add_new")}</span>
            </button>
            <div className="flex flex-row items-center gap-2">
              <Select
                id={htmlIds.select_bug_report_select_status}
                className="bg-gray-50  h-10 w-40 md:w-60 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600"
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
                id={htmlIds.btn_bug_report_save_request}
                disabled={!rowSelectionModel.length || status === "unselected"}
                onClick={handleSave}
                className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
              >
                <span>{text("withdrawal_information_save_title")}</span>
              </button>
            </div>
          </div>
        </div>
        <div
          className="w-full bg-white flex-grow mt-1"
        >
          <DataGridPro
            onRowsScrollEnd={handleScrollEnd}
            rows={txidManagementWithIndex}
            columns={columns}
            rowCount={txidManagementWithIndex?.length || 0}
            getRowId={(row) => row?.txid}
            loading={isLoading}
            disableSelectionOnClick
            paginationMode="server"
            sx={customisedTableClasses}
            hideFooter
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
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <TxidUpdateModal
        isSubmitting={isUpdateSubmitting}
        onOk={handleOnUpdateTxid}
        open={visibleTxidUpdateModal}
        onCancel={() => {
          setVisibleTxidUpdateModal(false);
          setSelectedTxidToUpdate(null);
        }}
        //eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        initialValues={initialTxidUpdateData}
      />
      <TxidDeleteModal
        isSubmitting={isDeleteSubmitting}
        selectedTxid={selectedTxidToDelete as string}
        onDelete={handleOnDeleteTxid}
        open={visibleTxidDeleteModal}
        onCancel={() => {
          setVisibleTxidDeleteModal(false);
          setSelectedTxidToDelete("");
        }}
      />
      <TXIDModal
        isEditMode={isEditMode}
        open={addNewModalOpen}
        onClose={handleAddNewTXIDClose}
        onSubmit={handleAddNewTXID}
        data={addNewTXIDData}
        setAddNewTXIDData={setAddNewTXIDData}
        loading={isAddNewSubmitting}
      />
    </div>
  );
}
export default TxidManagementPage;
