import React, { useEffect, useMemo, useState } from "react";
import { DateFormatter, Spinner } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  DataGridPro,
  GridColDef,
  GridRowParams,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import { UDUpdateUserModal } from "@sections/user-details/components/UDUpdateUserModal";
import {
  ISuperUserDetail,
  IUserBankAccountsResponse,
  useDeleteUserBankAccount,
  useGetAllBankAccountList,
  usePostSetUserMainBankAccount,
} from "api/hooks";
import { useLocale } from "locale";
import { toast } from "react-toastify";
import { queryClient } from "../../../../api";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

interface UserBankDetailsTabTabProps {
  userDetails?: ISuperUserDetail;
}

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const UserBankDetailsTab = ({ userDetails }: UserBankDetailsTabTabProps) => {
  const {
    data: allBankAccount,
    isFetching,
    isLoading,
    refetch: refetchAllBankList,
  } = useGetAllBankAccountList({
    user_id: userDetails?.user_id,
  });
  const {
    mutateAsync: deleteUserBankAccount,
    isLoading: isDeleteBankAccountLoading,
  } = useDeleteUserBankAccount();
  const { text } = useLocale();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const {
    mutateAsync: setUserMainBankAccount,
    isLoading: isSetUserMainBankAccountLoading,
  } = usePostSetUserMainBankAccount();

  const [posUpdateCreateModalProps, setPostUpdateCreateModalProps] = useState<{
    open: boolean;
    existingValues: [string | null, number | null];
    createForm?: boolean;
    tab?: string;
    bankId?: string | null;
  }>({
    open: false,
    existingValues: ["", null],
    createForm: true,
    bankId: null,
  });

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const { confirmDialog } = useDialog();

  const handleMakeItMainAccount = (bank_id: string) => {
    confirmDialog({
      title: text("user_details_wallet_set_main_account_confirmation_title"),
      content: text("user_details_wallet_set_main_account_confirmation_content"),
      onOk: async () => {
        setUserMainBankAccount({
          user_id: userDetails?.user_id,
          bank_id,
        })
          .then((res) => {
            // after successful update, i cleared the rowSelection array, this will uncheck all selected checkboxed
            setRowSelectionModel([]);
            refetchAllBankList();
            queryClient.invalidateQueries(["super-user-details"]);
            toast(res.result, {
              type: "success",
            });
          })
          .catch((err) => {
            toast(err.response.data.message || err.response.data.result, {
              type: "error",
            });
          });
      },
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("user_details_bank_details_tab_no"),
        minWidth: 80,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "bank_name",
        headerName: text("user_details_bank_details_tab_bank_name"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "bank_account_number",
        headerName: text("user_details_bank_details_tab_bank_account_number"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "is_main_account",
        headerName: text("user_details_bank_details_tab_is_main_account"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return row.is_main_account
            ? text("user_details_bank_details_yes")
            : text("user_details_bank_details_no");
        },
      },
      {
        ...sharedColDef,
        field: "created_at",
        headerName: text("user_details_bank_details_tab_created_at"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            row.created_at && (
              <p className="truncate">
                <DateFormatter value={row.created_at} breakLine />
              </p>
            )
          );
        },
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: text("user_details_bank_details_tab_updated_at"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            row.updatedAt && (
              <p className="truncate">
                <DateFormatter value={row.updatedAt} breakLine />
              </p>
            )
          );
        },
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("user_details_bank_details_tab_action"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            <div className={"flex space-x-3"}>
              <button
                className="flex items-center text-sm px-2 h-6 bg-blue-500 text-white rounded-md"
                onClick={() => {
                  setPostUpdateCreateModalProps({
                    open: true,
                    existingValues: [
                      row.bank_name,
                      Number(row.bank_account_number),
                    ],
                    createForm: false,
                    bankId: row.uuid,
                  });
                }}
              >
                {text("user_details_bank_details_tab_button_edit")}
              </button>
              <button
                disabled={row.is_main_account || isSetUserMainBankAccountLoading}
                className={`flex items-center text-sm px-2 h-6 ${row.is_main_account ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500"} text-white rounded-md`}
                onClick={() => handleMakeItMainAccount(row.uuid)}
              >
                {text("user_details_bank_details_tab_button_make_it_main")}
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, isSetUserMainBankAccountLoading],
  );

  const handleModalClose = () => {
    setPostUpdateCreateModalProps({
      open: false,
      existingValues: ["", null],
      createForm: true,
      bankId: null,
    });
  };

  const userBankDetailsWithIndex = useMemo(
    () =>
      allBankAccount?.userBankAccountsResponse?.map(
        (item: IUserBankAccountsResponse, index: number) => ({
          ...item,
          no: index + 1,
        }),
      ) || [],
    [allBankAccount?.userBankAccountsResponse],
  );

  const handleDelete = () => {
    const selectedCount = rowSelectionModel.length;
    const isMultiple = selectedCount > 1;
    confirmDialog({
      title: `${text("user_details_delete_bank_account")} ${isMultiple ? selectedCount : ""} ${text(isMultiple ? "user_details_delete_accounts" :"user_details_delete_account")}`,
      content: `${text("user_details_delete_confirmation_content")} ${text(isMultiple ? "user_details_multiple_accounts_selected" : "user_details_single_account_selected")}`,
      onOk: async () => {
        const bankIds: string[] = rowSelectionModel as unknown as string[];
        deleteUserBankAccount({
          bank_ids: [...bankIds],
        })
          .then((res) => {
            refetchAllBankList();
            toast(res.result, {
              type: "success",
            });
          })
          .catch((err) => {
            toast(err.response.data.result, {
              type: "error",
            });
          });
      },
    });
  };

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("userBankDetailsTabColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={"py-5 px-5"}>
      <UDUpdateUserModal
        open={posUpdateCreateModalProps.open}
        onClose={handleModalClose}
        type={"bankName"}
        userId={userDetails?.user_id || ""}
        existingValues={posUpdateCreateModalProps.existingValues}
        createForm={posUpdateCreateModalProps.createForm}
        tab={"userBankDetails"}
        updateId={posUpdateCreateModalProps.bankId}
      />
      <div className={"flex justify-between space-x-2 my-5"}>
        <span className="text-gray-400 text-2xl text-grey">
          {text("users_detail_tab_bank_details")}
        </span>

        <div className="flex">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
          <button
            className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md mr-1"
            onClick={() =>
              setPostUpdateCreateModalProps({
                open: true,
                existingValues: ["", null],
                createForm: true,
                bankId: null,
              })
            }
          >
            <PlusIcon className="w-5 stroke-2 mr-2" />
            <span>{text("user_details_add_bank_account")}</span>
          </button>

          <button
            className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-500 text-white rounded-md"
            onClick={handleDelete}
            disabled={
              isDeleteBankAccountLoading || rowSelectionModel?.length === 0
            }
          >
            <TrashIcon className="w-5 stroke-2 mr-2" />
            <span>{text("user_details_delete_bank_account")}</span>
            {isDeleteBankAccountLoading && <Spinner className={"ml-2"} />}
          </button>
        </div>
      </div>

      <div className="w-full bg-white tableContainer">
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={userBankDetailsWithIndex}
          columns={columns}
          loading={isFetching || isLoading || isSetUserMainBankAccountLoading}
          disableSelectionOnClick
          sx={{
            ...customisedTableClasses,
            // eslint-disable-next-line quotes
            '& .MuiDataGrid-columnHeaderCheckbox input[type="checkbox"]:checked':
            {
              backgroundColor:
                rowSelectionModel?.length + 1 ===
                  userBankDetailsWithIndex.length
                  ? "#2563eb"
                  : "transparent",
              border:
                rowSelectionModel?.length + 1 ===
                  userBankDetailsWithIndex.length
                  ? "1px solid #2563eb"
                  : "1px solid #6b7280",
            },
          }}
          hideFooter
          checkboxSelection
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          isRowSelectable={(params: GridRowParams) =>
            !params.row.is_main_account
          }
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
        />
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
};

export default UserBankDetailsTab;
