import { DateFormatter, Spinner } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  DataGridPro,
  GridColDef,
  GridRowParams,
  GridSelectionModel
} from "@mui/x-data-grid-pro";
import { UDUpdateUserModal } from "@sections/user-details/components/UDUpdateUserModal";
import {
  ISuperUserDetail,
  useDeleteUserWalletAccount,
  useGetAllWalletAccountList,
  usePostSetUserMainWalletAccount,
  UserWalletAccount,
} from "api/hooks";
import { useLocale } from "locale";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { queryClient } from "api";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

interface UserWalletDetailsTabProps {
  userDetails?: ISuperUserDetail;
}

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1
};

const UserWalletDetailsTab = ({ userDetails }: UserWalletDetailsTabProps) => {
  const {
    data: allWalletAccount,
    isFetching,
    isLoading,
    refetch: refetchAllWalletList,
  } = useGetAllWalletAccountList({
    user_id: userDetails?.user_id,
  });

  const {
    mutateAsync: deleteUserWalletAccount,
    isLoading: isDeleteWalletAccountLoading,
  } = useDeleteUserWalletAccount();

  const {
    mutateAsync: setUserMainWalletAccount,
    isLoading: isSetUserMainWalletAccountLoading,
  } = usePostSetUserMainWalletAccount();

  const { text } = useLocale();

  const [posUpdateCreateModalProps, setPostUpdateCreateModalProps] = useState<{
    open: boolean;
    existingValues: [string | null, number | null];
    createForm?: boolean;
    tab?: string;
    walletUuid?: string | null;
  }>({
    open: false,
    existingValues: ["", null],
    createForm: true,
    walletUuid: null,
  });
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const { confirmDialog } = useDialog();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const handleMakeItMainAccount = (id: string) => {
    confirmDialog({
      title: text("user_details_wallet_set_main_account_confirmation_title"),
      content: text("user_details_wallet_set_main_account_confirmation_content"),
      onOk: async () => {
        setUserMainWalletAccount({
          user_id: userDetails?.user_id,
          id,
        })
          .then((res) => {
            refetchAllWalletList();
            queryClient.invalidateQueries(["super-user-details"]);
            toast(res.result, {
              type: "success",
            });
          })
          .catch((err) => {
            toast(err.response.data.result || err.response.data.message, {
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
        headerName: text("user_details_wallet_details_tab_no"),
        minWidth: 80,
        disableReorder: true
      },
      {
        ...sharedColDef,
        field: "wallet_id",
        headerName: text("user_details_wallet_details_tab_wallet_id"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "wallet_type",
        headerName: text("user_details_wallet_details_tab_wallet_type"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "is_main_wallet",
        headerName: text("user_details_wallet_details_tab_is_main_account"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return row.is_main_wallet
            ? text("user_details_wallet_details_yes")
            : text("user_details_wallet_details_no");
        },
      },
      {
        ...sharedColDef,
        field: "created_at",
        headerName: text("user_details_wallet_details_tab_created_at"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            row.created_at && (
              <p className="truncate"><DateFormatter value={row.created_at} breakLine /></p>
            )
          );
        },
      },
      {
        ...sharedColDef,
        field: "updatedAt",
        headerName: text("user_details_wallet_details_tab_updated_at"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            row.updatedAt && (
              <p className="truncate"><DateFormatter value={row.updatedAt} breakLine /></p>
            )
          );
        },
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("user_details_wallet_details_tab_action"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            <div className={"flex space-x-3"}>
              <button
                className="flex items-center text-sm px-2 h-6 bg-blue-500 text-white rounded-md"
                onClick={() => {
                  setPostUpdateCreateModalProps({
                    open: true,
                    existingValues: [row.wallet_id, Number(row.wallet_id)],
                    createForm: false,
                    walletUuid: row.uuid,
                  });
                }}
              >
                {text("user_details_wallet_details_tab_button_edit")}
              </button>
              <button
                disabled={row.is_main_wallet || isSetUserMainWalletAccountLoading}
                className={`flex items-center text-sm px-2 h-6 ${row.is_main_wallet ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500"} text-white rounded-md`}
                onClick={() => handleMakeItMainAccount(row.uuid)}
              >
                {text("user_details_wallet_details_tab_button_make_it_main")}
              </button>
            </div>
          );
        },
      },
    ],
     // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const handleModalClose = () => {
    setPostUpdateCreateModalProps({
      open: false,
      existingValues: ["", null],
      createForm: true,
      walletUuid: null,
    });
  };

  const userWalletDetailsWithIndex = useMemo(
    () =>
      allWalletAccount?.userWalletAccountsResponse?.map(
        (item: UserWalletAccount, index: number) => ({
          ...item,
          no: index + 1,
        }),
      ) || [],
    [allWalletAccount?.userWalletAccountsResponse],
  );

  const handleDelete = () => {
    const selectedCount = rowSelectionModel.length;
    const isMultiple = selectedCount > 1;
    confirmDialog({
      title: `${text("user_details_delete_wallet_account")} ${isMultiple ? selectedCount : ""} ${text(isMultiple ? "user_details_wallet_accounts" :"user_details_wallet_account")}`,
      content: `${text("user_details_delete_wallet_confirmation_content")} ${text(isMultiple ? "user_details_multiple_wallet_accounts_selected" : "user_details_single_wallet_account_selected")}`,
      onOk: async () => {
        const walletIds: string[] = rowSelectionModel as unknown as string[];
        deleteUserWalletAccount({
          wallet_ids: [...walletIds],
        })
          .then((res) => {
            refetchAllWalletList();
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
  } = useGridColumnChange("userWalletDetailsTabColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div className={"p-5"}>
      <UDUpdateUserModal
        open={posUpdateCreateModalProps.open}
        onClose={handleModalClose}
        type={"usdt_wallet"}
        userId={userDetails?.user_id || ""}
        existingValues={posUpdateCreateModalProps.existingValues}
        createForm={posUpdateCreateModalProps.createForm}
        updateId={posUpdateCreateModalProps.walletUuid}
      />

      <div className={"flex justify-between space-x-2 mb-5"}>
        <span className="text-gray-400 text-2xl text-grey">
          {text("users_detail_tab_wallet_details")}
        </span>
        <div className="flex">
          {(Object.keys(columnCurrentState).length > 0) &&
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          }
          <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
          <button
            className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md mr-1"
            onClick={() =>
              setPostUpdateCreateModalProps({
                open: true,
                existingValues: ["", null],
                createForm: true,
                walletUuid: null,
              })
            }
          >
            <PlusIcon className="w-5 stroke-2 mr-2" />
            <span>{text("user_details_add_wallet_account")}</span>
          </button>

          <button
            className="flex items-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-600 text-white rounded-md"
            onClick={handleDelete}
            disabled={
              isDeleteWalletAccountLoading || rowSelectionModel?.length === 0
            }
          >
            <TrashIcon className="w-5 stroke-2 mr-2" />
            <span>{text("user_details_delete_wallet_account")}</span>
            {isDeleteWalletAccountLoading && <Spinner className={"ml-2"} />}
          </button>
        </div>
      </div>
      <div className="w-full bg-white tableContainer">
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={userWalletDetailsWithIndex}
          columns={columns}
          loading={isFetching || isLoading || isSetUserMainWalletAccountLoading}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          checkboxSelection
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          isRowSelectable={(params: GridRowParams) =>
            !params.row.is_main_wallet
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

export default UserWalletDetailsTab;
