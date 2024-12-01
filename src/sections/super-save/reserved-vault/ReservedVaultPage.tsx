import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import { DataGridPro, GridColDef, GridEventListener } from "@mui/x-data-grid-pro";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import ReservedVaultModal, {
  ReservedVaultModalFormType,
} from "./components/ReservedVaultModal/ReservedVaultModal";
import { Button } from "@mui/material";
import {
  PreviewCertificateModalRef,
  PreviewCertificateModal,
  SetSuperSaveLimitModal,
} from "./components";
import {
  DataFilterType,
  LanguageSelectedTab,
  DateFormatter,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import {
  useGetReserve,
  useSaveFile,
  useDeleteReserve,
  useUpdateReserve,
  useSaveReserveVault,
  IReserve,
  usePostAdminHistoryLog,
} from "api/hooks";
import { arrayToString, resetMUIToolbarFilter, scrollToTop } from "@common/utils/helpers";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { useTimezone } from "@common/hooks";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { toast } from "react-toastify";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function ReservedVaultPage() {
  const { text } = useLocale();
  const { timezone } = useTimezone();
  const { confirmDialog, alertDialog } = useDialog();
  const previewCertificateModal = useRef<PreviewCertificateModalRef>(null);

  const [openReservedModal, setOpenReservedModal] = useState<
    "new" | "edit" | null
  >(null);
  const [openSuperSaveLimitModal, setOpenSuperSaveLimitModal] =
    useState<boolean>(false);
  const [reservedModalFormData, setReservedModalFormData] = useState<
    ReservedVaultModalFormType | undefined
  >();


  const [lastId, setLastId] = useState<string>();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [reservedList, setReservedList] = useState<IReserve[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState({
    label: text("deposit_information_krw_suffix"),
    type: "KRW",
  });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data, isFetching, refetch } = useGetReserve(
    {
      limit: 25,
      type: selectedLang.type,
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
        setReservedList((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.reserves,
        ]);
      },
    },
  );

  const { mutateAsync: saveFile } = useSaveFile();
  const { mutateAsync: deleteReserve } = useDeleteReserve();
  const { mutateAsync: updateReserve } = useUpdateReserve();
  const { mutateAsync: saveReservedVault } = useSaveReserveVault();

  useEffect(() => {
    setSelectedLang({
      type: "KRW",
      label: text("deposit_information_krw_suffix"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (
    event: React.ChangeEvent<object>,
    newValue: string,
  ) => {
    const label = (event.currentTarget as HTMLElement).innerText;
    setSelectedLang({
      type: newValue,
      label,
    });
    setLastId(undefined);
    scrollToTop();
    resetSorting();
  };

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const handleExcelDownload = () => {
    jsonToExcelDownload(
      data?.reserves?.map((item, index) => ({
        [text("reserved_vault_column_header_no")]: index + 1,
        [text("reserved_vault_column_header_bank")]: item.bank,
        [selectedLang.type === "KRW"
          ? text("reserved_vault_column_header_account_number")
          : text("add_reserved_vault_vault_id")]: item.accountNumber,
        [selectedLang.type === "KRW"
          ? text("reserved_vault_column_header_account_balance")
          : text("add_reserved_vault_vault_balance")]: item.accountBalance,
        [text("reserved_vault_column_header_confirmation_date")]:
          item.confirmationDate,
        [text("reserved_vault_column_header_created_at")]: formatDateAndTime(
          item.createdAt,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
        [text("reserved_vault_column_header_manager")]: item.action_by,
      })),
      `${arrayToString([
        text("reserved_vault_file_name"),
        formatDate(new Date(), false, "YYYY-MM-DD"),
        selectedLang.type,
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("reserved_vault_file_name"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  const handleCloseSuperSaveLimitModal = () => {
    setOpenSuperSaveLimitModal(false);
  };

  const handleReservedVaultModalClose = useCallback(() => {
    setOpenReservedModal(null);
    setReservedModalFormData({
      confirmationDate: "",
      accountNumber: "",
      bank: "",
      bankCertificateUrl: null,
      accountBalance: 0,
      id: "",
    });
  }, []);

  const handleSaveReservedVault = useCallback(
    async (formData: ReservedVaultModalFormType, onSuccess: () => void) => {
      setLoading(true);
      if (
        formData.bankCertificateUrl?.[0] &&
        typeof formData.bankCertificateUrl !== "string"
      ) {
        await saveFile(
          { file: formData.bankCertificateUrl[0] },
          {
            onSuccess: async (url) => {
              saveReservedVault(
                {
                  ...formData,
                  bank: selectedLang.type === "KRW" ? formData.bank : "USDT",
                  bankCertificateUrl: url,
                  accountBalance: Number(formData.accountBalance),
                },
                {
                  onSuccess: () => {
                    if (lastId !== undefined) {
                      setLastId(undefined);
                    } else {
                      refetch();
                    }
                    document
                      ?.querySelector?.(".MuiDataGrid-virtualScroller")
                      ?.scrollTo?.({ top: 0 });
                    toast.success(text("add_reserved_vault_saved_title"));
                    onSuccess();
                    handleReservedVaultModalClose();
                    setLoading(false);
                  },
                },
              ).catch(error => {
                toast.error(error?.response?.data?.error);
                setLoading(false);
              });
            },
          },
        );
      }
    },
    [
      alertDialog,
      handleReservedVaultModalClose,
      lastId,
      refetch,
      saveFile,
      saveReservedVault,
      selectedLang.type,
      text,
    ],
  );

  const handleUpdateReservedVault = useCallback(
    async (formData: ReservedVaultModalFormType, onSuccess: () => void) => {
      setLoading(true);
      if (
        formData.bankCertificateUrl?.[0] &&
        typeof formData.bankCertificateUrl !== "string"
      ) {
        await saveFile(
          { file: formData.bankCertificateUrl[0] },
          {
            onSuccess: async (url) => {
              updateReserve(
                {
                  ...formData,
                  reserveId: formData.id,
                  bankCertificateUrl: url,
                  accountBalance: Number(formData.accountBalance),
                },
                {
                  onSuccess: () => {
                    if (lastId !== undefined) {
                      setLastId(undefined);
                    } else {
                      refetch();
                    }
                    document
                      ?.querySelector?.(".MuiDataGrid-virtualScroller")
                      ?.scrollTo?.({ top: 0 });

                    toast.success(text("reserved_vault_updated"));
                    setLoading(false);
                    onSuccess();
                  },
                },
              );
            },
          },
        );
      } else {
        updateReserve(
          {
            ...formData,
            reserveId: formData.id,
            bankCertificateUrl: formData.bankCertificateUrl as string,
            accountBalance: Number(formData.accountBalance),
          },
          {
            onSuccess: () => {
              if (lastId !== undefined) {
                setLastId(undefined);
              } else {
                refetch();
              }
              document
                ?.querySelector?.(".MuiDataGrid-virtualScroller")
                ?.scrollTo?.({ top: 0 });

              toast.success(text("reserved_vault_updated"));
              setLoading(false);
              onSuccess();
            },
          },
        ).catch(error => {
          toast.error(error?.response?.data?.error);
          setLoading(false);
        });
      }
    },
    [alertDialog, lastId, refetch, saveFile, text, updateReserve],
  );

  const handleChangeDataFilter = useCallback(
    (dataFilter: DataFilterType) => {
      setLastId(undefined);
      setDataFilter(dataFilter);
    },
    [setDataFilter],
  );

 const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (reservedList?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [reservedList?.length, data?.hasNext, data?.lastId]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: `${text("reserved_vault_column_header_no")}`,
        minWidth: 80,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "bankCertificateUrl",
        headerName: text("reserved_vault_colummn_header_certificate"),
        minWidth: 150,
        renderCell: ({ value, row }) => (
          <>
            <Button
              id={
                htmlIds.btn_reserved_vault_preview_certificate_modal_open_ +
                row.no
              }
              onClick={() => {
                setSelectedCertificate(value);
                previewCertificateModal.current?.open();
              }}
              endIcon={<OpenInNewIcon fontSize="small" />}
              color="inherit"
              disableRipple
            >
              View Certificate
            </Button>
          </>
        ),
      },
      {
        ...sharedColDef,
        field: "bank",
        headerName: text("reserved_vault_column_header_bank"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "accountNumber",
        headerName:
          selectedLang.type === "KRW"
            ? text("reserved_vault_column_header_account_number")
            : text("add_reserved_vault_vault_id"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "accountBalance",
        headerName:
          selectedLang.type === "KRW"
            ? text("reserved_vault_column_header_account_balance")
            : text("add_reserved_vault_vault_balance"),
        minWidth: 200,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)}{" "}
            {text("deposit_information_krw_suffix")}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "confirmationDate",
        headerName: text("reserved_vault_column_header_confirmation_date"),
        minWidth: 200,
        type: "date",
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("reserved_vault_column_header_created_at"),
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
        field: "action_by",
        headerName: text("reserved_vault_column_header_manager"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "edit_actions",
        headerName: text("reserved_vault_column_header_actions"),
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          return (
            <div className="w-[100%] flex justify-evenly items-center">
              <button
                id={htmlIds.btn_reserved_vault_edit_ + row.no}
                className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md"
                onClick={() => {
                  setOpenReservedModal("edit");
                  setReservedModalFormData({
                    accountBalance: row.accountBalance,
                    accountNumber: row.accountNumber,
                    bank: row.bank,
                    bankCertificateUrl: row.bankCertificateUrl,
                    confirmationDate: row.confirmationDate,
                    id: row.id,
                  });
                }}
              >
                {text("reserved_vault_edit")}
              </button>
              <button
                id={htmlIds.btn_reserved_vault_delete_ + row.no}
                className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md"
                onClick={() =>
                  confirmDialog({
                    title: text("reserved_vault_delete_confirmation_title"),
                    content: text("reserved_vault_delete_content"),
                    onOk: async () => {
                      try {
                        await deleteReserve({ reserveId: [row.id] });
                        toast.success(text("reserved_vault_delete_success"));
                        refetch();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (err: any) {
                          toast.error(err.response?.data.msg || text("toast_error_something_went_wrong_try_again"));
                        }
                      }
                  })
                }
              >
                {text("reserved_vault_delete_title")}
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, selectedLang.type],
  );

  const reservesWithIndex = useMemo(
    () =>
      reservedList.map((item, index) => ({
        ...item,
        no: index + 1,
      })) || [],
    [reservedList],
  );

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    resetSorting,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("reservedVaultColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("reserved_vault_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("reserved_vault_detail")}
        </span>
      </div>
      <LanguageSelectedTab
        selectedLang={selectedLang}
        handleLanguageChange={handleLanguageChange}
      />

      <FiltersWrapper handleDataFilterChange={handleChangeDataFilter} />

      <div className="flex flex-wrap gap-1 justify-between tems-center py-3">
        <div className="flex flex-wrap gap-1">
          <button
            id={htmlIds.btn_reserved_vault_modal_open}
            onClick={() => setOpenReservedModal("new")}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
          >
            <span>{text("reserved_vault_add_reserved_vault")}</span>
          </button>
          <button
            onClick={() => setOpenSuperSaveLimitModal(true)}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
          >
            <span>{text("reserved_vault_set_super_save_limit")}</span>
          </button>
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <button
            id={htmlIds.btn_reserved_vault_excel_download}
            onClick={handleExcelDownload}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
          >
            <span>{text("reserved_vault_excel_download")}</span>
          </button>
        </div>
      </div>

      <div
        id={htmlIds.div_reserved_vault_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.id}
          rows={reservesWithIndex}
          paginationMode="server"
          rowCount={reservesWithIndex.length || 0}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
      <ReservedVaultModal
        type={selectedLang.type}
        open={openReservedModal === "edit" || openReservedModal === "new"}
        formData={reservedModalFormData}
        formType={openReservedModal === "edit" ? "Edit" : "Add"}
        submit={
          openReservedModal === "new"
            ? handleSaveReservedVault
            : handleUpdateReservedVault
        }
        handleClose={handleReservedVaultModalClose}
        loading={loading}
      />
      <PreviewCertificateModal
        type={selectedLang.type}
        url={selectedCertificate}
        ref={previewCertificateModal}
      />

      <SetSuperSaveLimitModal
        open={openSuperSaveLimitModal}
        handleCloseSuperSaveLimitModal={handleCloseSuperSaveLimitModal}
        type={selectedLang.type}
      />

      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default ReservedVaultPage;
