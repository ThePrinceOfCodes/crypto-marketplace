import { htmlIds } from "@cypress/utils/ids";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DataGridPro, GridColDef, GridEventListener } from "@mui/x-data-grid-pro";
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
} from "@mui/material";
import { customisedTableClasses } from "@common/constants/classes";
import { LocalKeys, useLocale } from "locale";
import { useAuth, useDialog } from "@common/context";
import {
  IMsqPlatformUsers,
  useGetMsqPlatformUsers,
  useUpdateUserRole,
  useUpdateUserVerify,
  useUpdateAdminRoles,
} from "api/hooks";
import { DateFormatter } from "@common/components/DateFormatter";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import SaveIcon from "@mui/icons-material/Save";
import _debounce from "lodash/debounce";
import { SearchBox } from "@common/components/SearchBox";
import axios from "axios";
import { scrollToTop } from "@common/utils/helpers";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  disableColumnMenu: true,
  flex: 1,
};

const ignoreEmails = [
  "admin@admin.com",
  "admin1@admin.com",
  "admin2@admin.com",
  "admin3@admin.com",
  "admin4@admin.com",
];

const permissions = ["create", "show", "update", "delete"];

function MsqPlatformUsers() {
  const { text } = useLocale();
  const { confirmDialog } = useDialog();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated, hasAuth, checkAuth, user, userRoleV2, userRole } =
    useAuth();
  const [lastId, setLastId] = useState<string | undefined>();
  const [searchKey, setSearchKey] = useState<string>("");
  const [activeRow, setActiveRow] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userRoles, setUserRoles] = useState<any>([]);
  const [adminRolesLoading, setAdminRolesLoading] = useState<boolean>(false);
  const [msqPlatformUsers, setMsqPlatformUserss] = useState<
    IMsqPlatformUsers[]
  >([]);

  const {
    data: allMsqPlatformUsersData,
    isLoading: isMsqPlatformUserLoading,
    isFetching: isMsqPlatformUserFetching,
    refetch
  } = useGetMsqPlatformUsers(
    { limit: 25, lastId, searchKey },
    {
      enabled: hasAuth("platformUser") && isAuthenticated,
      onSuccess: (data) => {
       if (lastId !== undefined) {
        setMsqPlatformUserss((prev) => [...prev, ...data.allUsers]);
      } else {
        setMsqPlatformUserss(data.allUsers);
      }
      },
    },
  );

  const { mutateAsync: updateUserRole, isLoading: update_role_loading } = useUpdateUserRole();

  const { mutateAsync: updateUserVerify } = useUpdateUserVerify({
    onSuccess: () => {
      setLastId(undefined);
      lastId === undefined && refetch();
      toast.success(text("toast_success_verified"));
      setActiveRow(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response.data.message);
      setActiveRow(null);
    },
  });

  const { mutateAsync: updateAdminRolesFn } = useUpdateAdminRoles();

  const updateAdminRoles = () => {
    setAdminRolesLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise.all(userRoles.map((payload: any) => updateAdminRolesFn(payload)))
      .then(() => {
        toast.success(text("toast_success_upload_admin_roles_sucess"));
        setAdminRolesLoading(false);
        setLastId(undefined);
        scrollToTop();
        setUserRoles([]);
        lastId === undefined && refetch();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        setAdminRolesLoading(false);
        setUserRoles([]);
        toast.error(error.response?.data?.error || text("toast_error_updating_admin_roles"));
      });
  };

  const handleApproveOrReject = async (email: string, isApproved: boolean) => {
    try {
      setActiveRow(email);
      const result = await updateUserRole({
        approve: isApproved,
        email,
      });
      setLastId(undefined);
      scrollToTop();
      toast.success(result.data?.message);
      lastId === undefined && refetch();
    }
    catch(err){
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.error || err.response?.data?.message);
      } else {
        toast.error(text("toast_error_something_went_wrong_try_again"));
      }
    }
    finally {
      setActiveRow(null);
    }
  };

   const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (msqPlatformUsers?.length > 0 && allMsqPlatformUsersData?.hasNext) {
      setLastId(allMsqPlatformUsersData?.lastId);
    }
  }, [msqPlatformUsers?.length, allMsqPlatformUsersData?.hasNext, allMsqPlatformUsersData?.lastId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeSearch = useCallback(
    _debounce((text: string) => {
      if (text.trim().length >= 3 || text.trim().length === 0) {
        setSearchKey(text.trim());
        setLastId(undefined);
      }
    }, 500),
    [],
  );


  const permissionNames = [
    "platform",
    "ads",
    "inquiry",
    "card",
    "clearCache",
    "mysql",
    "news",
    "popup",
    "notification",
    "platformUser",
    "withdrawal",
    "user",
    "token",
    "p2u",
    "supersave",
  ];

  const authColumns: GridColDef[] = permissionNames.map((headerName) => {
    return {
      ...sharedColDef,
      field: headerName,
      headerName: text(`msq_admin_column_${headerName}` as LocalKeys),
      minWidth: 100,
      renderCell: ({ row: { roles, roles_v2, email } }) => {
        const isAuth =
          roles_v2 && checkAuth(roles, JSON.parse(roles_v2), headerName);
        const isRoot = roles_v2 && checkAuth(roles, JSON.parse(roles_v2), "root");

        const isChecked = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const role = userRoles.find((el: any) => el.email === email);

          if (role) {
            return role.roles_v2[headerName];
          }

          return isAuth && !isRoot;
        };

        return (
          <label htmlFor={htmlIds.div_msq_platform_users_checkbox}>
            <Checkbox
              aria-label={headerName}
              checked={isChecked()}
              disabled={isRoot}
              onChange={(event) => {
                const userExists = userRoles.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (el: any) => el.email === email,
                );

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updateUserRoles = (updatedItem: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setUserRoles((prev: any) =>
                    [
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ...prev.filter((r: any) => r.email !== email),
                      updatedItem,
                    ].filter((role) => Object.keys(role.roles_v2).length > 0),
                  );
                };

                const addRole = () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setUserRoles((prev: any) => [
                    ...prev,
                    {
                      email,
                      roles_v2: {
                        [headerName]: permissions,
                      },
                    },
                  ]);
                };

                if (roles_v2) {
                  const parsedRoles = JSON.parse(roles_v2);

                  if (userExists) {
                    const updatedItem = { ...userExists };

                    if (event.target.checked) {
                      updatedItem.roles_v2[headerName] = permissions;
                    } else {
                      delete updatedItem.roles_v2[headerName];
                    }

                    updateUserRoles(updatedItem);
                  } else {
                    if (event.target.checked) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setUserRoles((prev: any) => [
                        ...prev,
                        {
                          email,
                          roles_v2: { ...parsedRoles, [headerName]: permissions },
                        },
                      ]);
                    } else {
                      delete parsedRoles[headerName];
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setUserRoles((prev: any) => [
                        ...prev,
                        {
                          email,
                          roles_v2: parsedRoles,
                        },
                      ]);
                    }
                  }
                } else {
                  if (userExists) {
                    const updatedItem = { ...userExists };

                    if (event.target.checked) {
                      updatedItem.roles_v2[headerName] = permissions;
                    } else {
                      delete updatedItem.roles_v2[headerName];
                    }

                    updateUserRoles(updatedItem);
                  } else if (event.target.checked) {
                    addRole();
                  }
                }
              }}
            />
          </label>
        );
      },
    };
  });

  const columns: GridColDef[] = [
    {
      ...sharedColDef,
      field: "name",
      headerName: `${text("add_platform_header_name")}`,
      minWidth: 250,
      renderCell: ({ value }) => {
        return (
          <div className="flex w-full justify-start items-center">
            <p className="pl-2 truncate"> {value}</p>
          </div>
        );
      },
    },
    {
      ...sharedColDef,
      field: "email",
      headerName: `${text("add_new_admin_email")}`,
      minWidth: 250,
      renderCell: ({ row }) => {
        return (
          <div className="flex w-full justify-start items-center">
            <p className="pl-2 truncate">{row.email}</p>
          </div>
        );
      },
    },
    {
      ...sharedColDef,
      field: "roles",
      headerName: `${text("msq_admin_column_is_super_admin")}`,
      minWidth: 150,
      renderCell: ({ row: { roles, roles_v2, email } }) => {
        roles_v2 = JSON.parse(roles_v2 ? roles_v2 : "{}");
        const isApproved = checkAuth(roles, roles_v2, "root");
        const label = isApproved
          ? text("add_platform_disapprove_btn")
          : text("add_platform_approve_btn");
        const color = isApproved ? "error" : "success";
        const confirmContent = isApproved
          ? text("platform_user_decline_super_admin_confirmation")
          : text("platform_user_approve_super_admin_confirmation");

        return (
          <div className="flex w-full justify-start items-center">
            <Chip
              size="medium"
              variant="outlined"
              sx={{ minWidth: 100 }}
              label={label}
              color={color}
              onClick={() => {
                confirmDialog({
                  title: text("confirmation"),
                  content: confirmContent,
                  onOk: () => handleApproveOrReject(email, isApproved)
                });
              }}
              disabled={ignoreEmails.includes(email)}
            />
          </div>
        );
      },
    },
    {
      ...sharedColDef,
      field: "verified",
      headerName: `${text("msq_admin_column_email_verified")}`,
      minWidth: 150,
      renderCell: ({ row: { email, verified } }) => (
        <div className="flex w-full justify-start items-center">
          <Chip
            size="medium"
            variant="outlined"
            sx={{ minWidth: 100 }}
            label={
              verified
                ? text("platform_user_verified_btn")
                : text("platform_user_not_verified_btn")
            }
            color={verified ? "success" : "error"}
            onClick={() => {
              confirmDialog({
                title: text("confirmation"),
                content: text("platform_user_verify_email_confirmation"),
                onOk: async () => {
                  await updateUserVerify(email);
                  setLastId(undefined);
                  setActiveRow(email);
                  lastId === undefined && refetch();
                },
              });
            }}
            icon={
              update_role_loading && activeRow === verified ? (
                <CircularProgress size={18} />
              ) : undefined
            }
            disabled={verified}
          />
        </div>
      ),
    },
    ...authColumns,
    {
      ...sharedColDef,
      field: "createdAt",
      headerName: `${text("add_platform_header_created_at")}`,
      minWidth: 170,
      renderCell: ({ value }) =>
        value && (
          <span className="whitespace-normal w-fit ">
            <DateFormatter value={value} />
          </span>
        ),
    },
    {
      ...sharedColDef,
      field: "Actions",
      headerName: "Actions",
      headerAlign: "center",
      minWidth: 120,
      renderCell: ({ row: { email } }) => {
        return (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Chip
              label="Save"
              color="primary"
              sx={{ width: 80 }}
              icon={
                userRoles.length === 1 &&
                  adminRolesLoading &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  userRoles.find((el: any) => el.email === email) ? (
                  <CircularProgress size={16} />
                ) : (
                  <SaveIcon fontSize="small" />
                )
              }
              onClick={updateAdminRoles}
              disabled={
                userRoles.length > 1
                  ? true
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : !userRoles.find((el: any) => el.email === email)
              }
            />
          </Box>
        );
      },
    },
  ];

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
  } = useGridColumnChange("msqPlatformUsersColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium" id={htmlIds.text_platforms_header}>
          {text("menu_bar_title_platform_users")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("msq_admin_platforms_detail")}
        </span>
      </div>
      <div className="flex flex-wrap flex-col md:flex-row md:justify-between w-full gap-3 mb-5">
        <div className="sm:flex items-start">
          <SearchBox onChangeFunc={onChangeSearch} />
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <Box className="sm:flex md:justify-end">
          <button
            className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
            onClick={updateAdminRoles}
            disabled={userRoles.length < 2}
          >
            {userRoles.length > 1 && adminRolesLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon fontSize="small" />
            )}
            <span className="ml-2">{text("msq_admin_platforms_multiple_save")}</span>
          </button>
        </Box>
      </div>
      <div
        id={htmlIds.div_add_platform_page_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.email}
          rows={msqPlatformUsers}
          columns={columns}
          loading={isMsqPlatformUserLoading || isMsqPlatformUserFetching}
          rowCount={msqPlatformUsers.length}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          pinnedColumns={{
            right: ["Actions"],
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
}
export default MsqPlatformUsers;