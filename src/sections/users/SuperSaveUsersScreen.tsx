import {
  DataFilterType,
  DateFormatter,
  Pagination,
  RejectSuperUserRequestModal,
  RejectSuperUserRequestModalRef,
  ShowEmail,
  Spinner,
  WithdrawalModal,
  WithdrawalModalRef,
} from "@common/components";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { formatDate, formatDateAndTime } from "@common/utils/formatters";
import { arrayToString, resetMUIToolbarFilter } from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import { Box, IconButton, Tooltip, Switch } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import {
  ISuperUser,
  UpdateSuperTrustStatus,
  useGetMassSuperUsers,
  useGetSuperUsers,
  usePostAdminHistoryLog,
  useRejectUserWithdrawalRequest,
  useUpdateSuperTrustStatus,
  SupersaveRestriction,
  usePostUpdateUserSuperSaveStatus,
} from "api/hooks";
import clsx from "clsx";
import { useLocale } from "locale";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
// import UserSuperTrustFilter from "@common/components/UserSuperTrustFilter";
import { useTimezone } from "@common/hooks";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { UpdateCommunityModal } from "./components/UpdateCommunity";
import { CommunityLinkButtons } from "./components/CommunityLinkButtons";
import { userDataType, RejectSuperSaveModal, RejectSuperSaveModalRef } from "@common/components/RejectSuperSaveModal";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const memberTypes = {
  corporate: "corporate",
  individual: "individual",
  all: "all",
};

function SuperSaveUsersScreen() {
  const [colRemoved, setColRemoved] = useState<string[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const { text } = useLocale();
  const { timezone } = useTimezone();

  const withdrawalModal = useRef<WithdrawalModalRef>(null);
  const rejectSuperSaveModal = useRef<RejectSuperSaveModalRef>(null);
  const rejectSuperUserRequestModal =
    useRef<RejectSuperUserRequestModalRef>(null);
  const { alertDialog, confirmDialog } = useDialog();

  const [showEmail, setShowEmail] = useState(false);
  const [withdrawUserEmail, setWithdrawUserEmail] = useState<string>();
  const [rejectSuperSaveData, setRejectSuperSaveData] = useState<userDataType>();
  const [rejectUserModal, setRejectUserModal] = useState({
    email: "",
    usdt_modal: false,
  });
  // const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [showUpdateTeamModal, setShowUpdateTeamModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    community: string;
  }>();
  const { data, isLoading, refetch, isRefetching } = useGetSuperUsers({
    limit,
    searchKey:
      (dataFilter?.searchKey?.length || 0) > 0
        ? dataFilter?.searchKey
        : undefined,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
    status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
    usdt_status:
      dataFilter?.usdt_status === "all" ? undefined : dataFilter?.usdt_status,
    page,
    member_type:
      dataFilter?.memberType === "all" ? undefined : dataFilter?.memberType,
    super_trust_status:
      dataFilter?.super_trust_status === "all"
        ? undefined
        : dataFilter?.super_trust_status,
    super_save_community:
      dataFilter?.super_save_community === "all"
        ? undefined
        : dataFilter?.super_save_community,
    super_save_restriction:
      dataFilter?.super_save_restriction === "all"
        ? undefined
        : dataFilter?.super_save_restriction,
  });

  const { mutateAsync: updateSuperTrustStatus } = useUpdateSuperTrustStatus();
  const { mutateAsync: updateUserSuperSaveStatus } =
    usePostUpdateUserSuperSaveStatus();
  const {
    mutateAsync: rejectUserWithdrawal,
    isLoading: loadingRejectUserWithdrawalRequest,
  } = useRejectUserWithdrawalRequest();

  const { mutateAsync: getMassUsers, isLoading: massDownloadLoading } =
    useGetMassSuperUsers();

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    const memberType = dataFilter?.memberType;

    if (memberType == "corporate")
      setColRemoved([
        "name",
        "birth_date",
        "phone",
        "nationality",
        "bank_name",
        "bank_account_number",
        "bank_account_holder_name",
      ]);
    else if (memberType == "individual")
      setColRemoved([
        "corporate_name",
        "business_registration_number",
        "business_registration_file",
        "corporate_bank",
        "corporate_bank_account_no",
        "corporate_bank_account_holder",
        "bank_statement_file",
        "corporate_representative",
        "corporate_phone",
        "corporate_email",
      ]);
    else setColRemoved([]);
  }, [dataFilter?.memberType]);

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const handleDataFilterChange = useCallback(
    (e: DataFilterType) => {
      setPage(1);
      const updatedFilter =
        !e.startDate && !e.endDate
          ? { startDate: e.startDate, endDate: e.endDate }
          : undefined;
      router.push({
        pathname: router.pathname, // The current path
        query: {
          ...Object.fromEntries(
            Object.entries({
              ...router.query,
              ...e,
              ...updatedFilter,
            }).filter(
              // eslint-disable-next-line
              ([_, v]) => v !== undefined && v !== null && v.length !== 0,
            ),
          ),
        },
      });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.usdt_status,
      router.query.status,
      router.query.searchKey,
      router.query.memberType,
      router.query.super_save_restriction,
      router.query.super_trust_status,
      router.query.super_save_community,
    ],
  );

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const getCorporateValues = (item: ISuperUser, value: ReactNode) =>
    item?.member_type === memberTypes.corporate ? value : "---";

  const onUpdate = async (props: UpdateSuperTrustStatus) => {
    try {
      await updateSuperTrustStatus(props, {
        onSuccess: () => {
          toast.success(text("super_save_user_super_trust_status_update"), {
            autoClose: 1500,
          });
          refetch();
        },
      });
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.error(text("super_save_user_community_offline_error"), {
          autoClose: 1500,
        });
      } else {
        toast.error(
          error.response?.data?.result ||
          "There was an error, please try again",
        );
      }
    }
  };

  const onUpdateSuperSaveStatus = async (props: SupersaveRestriction) => {
    const updateStatusData = {
      user_id: props.user_id,
      reason: ""
    };

    try {
      await updateUserSuperSaveStatus(updateStatusData, {
        onSuccess: () => {
          toast.success(text("user_super_save_status_update"), {
            autoClose: 1500,
          });
        },
      });
      refetch();
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.error(text("super_save_user_community_offline_error"), {
          autoClose: 1500,
        });
      } else {
        toast.error(
          error.response?.data?.result ||
          "There was an error, please try again",
        );
      }
    }
  };

  const onHandleRestriction = async (props: SupersaveRestriction) => {
    if (props.status) {
      setRejectSuperSaveData(props);
      rejectSuperSaveModal.current?.open();
    } else {
      confirmDialog({
        title: "Super Save",
        content: text("user_super_save_confirmation"),
        onOk: async () => onUpdateSuperSaveStatus(props),
      });
    };
  };

  const handleExcelDownload = (users: ISuperUser[]) => {
    jsonToExcelDownload(
      users?.map((item, index) => ({
        [text("users_column_header_no")]: index + 1,
        [text("users_column_header_user_name")]: item.user_name,
        [text("users_column_header_super_save_community")]:
          item.community || "---",
        [text("users_column_header_super_save_community_type")]: item.community
          ? item.community_type === 1
            ? text(
              "users_column_header_super_save_community_type_representative",
            )
            : text(
              "users_column_header_super_save_community_type_regular_member",
            )
          : "---",
        [text("users_column_header_user_super_trust_status")]:
          item.status === 1
            ? item?.super_trust_status === 1
              ? text("deposit_information_super_trust_enabled")
              : text("deposit_information_super_trust_disabled")
            : "---",
        [text("users_column_header_user_id")]: item.id,
        [text("users_column_header_email")]: item.email,
        [text("user_column_header_corporate_status")]:
          item.member_type === memberTypes.corporate
            ? text("users_member_type_corporation")
            : text("users_member_type_individual"),
        [text("user_column_header_airdrop_status")]:
          item.airdrop_status === 1
            ? text("view_airdrop_history_status_yes")
            : text("view_airdrop_history_status_no"),
        [text("users_column_header_membership_status")]:
          item.member_status === 0
            ? text("users_column_header_membership_normal")
            : item.member_status === 1
              ? text("users_column_header_membership_waiting_for_withdrawal")
              : item.member_status === 2
                ? text("users_column_header_membership_withdrawal_complete")
                : "",
        [text("users_column_header_register_super_save")]:
          item.status === 0
            ? text("users_column_header_waiting_for_approval")
            : item.status === 1
              ? text("users_status_approved")
              : item.status === 2
                ? text("users_denial_of_approval")
                : item.status === 3
                  ? text("users_status_completed")
                  : text("users_status_not_applicable"),
        [text("users_column_header_register_super_save_usdt")]:
          item.usdt_status === 0
            ? text("users_column_header_waiting_for_approval")
            : item.usdt_status === 1
              ? text("users_status_approved")
              : item.usdt_status === 2
                ? text("users_denial_of_approval")
                : text("users_status_not_applicable"),

        ...(dataFilter?.memberType !== memberTypes.corporate
          ? {
            [text("users_column_header_name")]: item.name,
            [text("users_column_header_birth_date")]: item?.birth_date
              ? formatDateAndTime(item.birth_date, "YYYY-MM-DD", timezone)
              : "",
            [text("users_column_header_phone_number")]: item.phone_number,
            [text("users_column_header_nationality")]: item.nationality,
            [text("users_column_header_bank")]: item.bank_name,
            [text("users_column_header_account_number")]:
              item.bank_account_number,
            // [text("users_column_header_account_holder")]: item.bank_account_holder_name
          }
          : {}),
        ...(dataFilter?.memberType !== memberTypes.individual
          ? {
            [text("user_column_header_corporate_name")]: item.corporate_name,
            [text("user_column_header_corporate_reg_no")]:
              item.business_registration_number,
            [text("user_column_header_business_registration")]:
              item.business_registration_file,
            [text("user_column_header_corporate_bank")]: getCorporateValues(
              item,
              item.bank_name,
            ),
            [text("user_column_header_corporate_bank_account_no")]:
              getCorporateValues(item, item.bank_account_number),
            [text("user_column_header_corporate_bank_account_holder")]:
              getCorporateValues(item, item.bank_account_holder_name),
            [text("user_column_header_corporate_bankbook")]:
              item.bank_statement_file,
            [text("user_column_header_corporate_representative")]:
              getCorporateValues(item, item.name),
            [text("user_column_header_corporate_contract_info")]:
              getCorporateValues(item, item.phone_number),
            [text("user_column_header_corporate_contract_email")]:
              getCorporateValues(item, item.corporate_email),
          }
          : {}),
        [text("users_column_header_approval_date")]: item?.action_date
          ? formatDateAndTime(item.action_date, "YYYY-MM-DD HH:mm:ss", timezone)
          : "",
        [text("users_column_header_offChain_address")]: item.offChainAddress,
        [text("users_column_header_onChain_address")]: item.onChainAddress,
        [text("users_column_header_registration_date")]: item.userSignUpDate
          ? formatDateAndTime(
            item.userSignUpDate,
            "YYYY-MM-DD HH:mm:ss",
            timezone,
          )
          : "---",
        [text("users_column_header_created_by")]: "User",
        [text("users_column_header_updated_date")]: item.userUpdatedDate
          ? formatDateAndTime(
            item.userUpdatedDate,
            "YYYY-MM-DD HH:mm:ss",
            timezone,
          )
          : "---",
        [text("users_column_header_updated_by")]: item?.userUpdatedBy || "---",
      })),
      `${arrayToString([
        text("users_file_name"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid:
        arrayToString([text("users_file_name"), formatDate(new Date())]) +
        ".xlsx",
    });
  };

  const handleRejectUserWithdrawalRequest = useCallback(
    async (withdraw_request_id: string) => {
      rejectUserWithdrawal(
        {
          withdraw_request_id,
        },
        {
          onSuccess: () => {
            alertDialog({
              title: text("users_membership_status_reject_completed"),
              onOk: async () => {
                refetch();
              },
            });
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleChangeTeam = (id: string, community: string | undefined) => {
    setSelectedUser({ id, community: community || "" });
    setShowUpdateTeamModal(true);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: `${text("users_column_header_no")}`,
        minWidth: 80,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "user_name",
        headerName: `${text("users_column_header_user_name")}`,
        minWidth: 250,
        renderCell: ({ row, value }) => (
          <div className="flex w-full justify-between">
            {value ? <p className="w-fit truncate">{value}</p> : "---"}
            <Link href={`/users/user-details?email=${row.email}&tabIndex=0`}>
              <Image
                className="ml-4 mt-0.5 cursor-pointer"
                width={14}
                height={14}
                src="/images/navigate-icon.svg"
                alt="Navigate Icon"
              />
            </Link>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "community",
        headerName: `${text("users_column_header_super_save_community")}`,
        minWidth: 200,
        renderCell: ({ row, value }) => (
          <div className={"flex w-full gap-2 items-center justify-between"}>
            {value?.length ? (
              <span className="w-fit truncate capitalize">{value}</span>
            ) : (
              <span>
                ---
              </span>
            )}
            {row.community_type !== 1 && (
              <button
                disabled={row.status !== 1}
                onClick={() => handleChangeTeam(row.id, row.community)}
                className="flex items-center justify-center text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
              >
                {text("change_button_text")}
              </button>
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "community_type",
        headerName: `${text("users_column_header_super_save_community_type")}`,
        minWidth: 200,
        renderCell: ({ row, value }) => (
          <div className={"flex w-full"}>
            <>
              {row?.community ? (
                <>
                  {value === 1 ? (
                    <span className="w-fit truncate">
                      {text(
                        "users_column_header_super_save_community_type_representative",
                      )}
                    </span>
                  ) : (
                    <span className="w-fit truncate">
                      {text(
                        "users_column_header_super_save_community_type_regular_member",
                      )}
                    </span>
                  )}
                </>
              ) : (
                <span className="w-fit truncate">---</span>
              )}
            </>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "super_save_restriction",
        headerName: `${text("users_column_header_user_super_save")}`,
        minWidth: 150,
        renderCell: ({ row }) => {
          const isEnabled = !row?.super_save_restriction || row?.super_save_restriction.trim().length === 0;
          return row?.status === 1 ? (
            <div>
              <Switch
                onClick={() =>
                  onHandleRestriction({
                    user_id: row?.id,
                    user_email: row?.email,
                    user_name: row?.user_name,
                    status: isEnabled,
                  })
                }
                checked={isEnabled}
                inputProps={{ style: { display: "none" } }}
              />
            </div>
          ) : (
            <p className="pl-6">---</p>
          );
        },
      },
      {
        ...sharedColDef,
        field: "super_trust_status",
        headerName: `${text("users_column_header_user_super_trust_status")}`,
        minWidth: 150,
        renderCell: ({ row, value }) => {
          return row?.status === 1 ? (
            <div>
              <Switch
                onClick={() =>
                  onUpdate({
                    user_id: row?.id,
                    status: value === 1 ? 0 : 1,
                  })
                }
                checked={value === 1}
                inputProps={{ style: { display: "none" } }}
              />
            </div>
          ) : (
            <p className="pl-6">---</p>
          );
        },
      },
      {
        ...sharedColDef,
        field: "id",
        headerName: `${text("users_column_header_user_id")}`,
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">{value}</span>
            <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
              <Box display="flex" alignItems="center">
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
        field: "email",
        headerName: `${text("users_column_header_email")}`,
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="flex w-full justify-between items-center">
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
        field: "member_status",
        headerName: `${text("users_column_header_membership_status")}`,
        minWidth: 160,
        renderCell: ({ value, row }) => {
          switch (value) {
            case 0:
              return <p>{text("users_column_header_membership_normal")}</p>;
            case 1:
              return (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-red-500 font-medium underline">
                    {text(
                      "users_column_header_membership_waiting_for_withdrawal",
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setWithdrawUserEmail(row?.email);
                        withdrawalModal.current?.open();
                      }}
                      className="group rounded-md border border-transparent bg-blue-600 px-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex justify-center"
                    >
                      {text("users_membership_status_approve")}
                    </button>
                    <button
                      onClick={() => {
                        confirmDialog({
                          title: row.name,
                          content: text(
                            "users_membership_status_reject_confirmation",
                          ),
                          onOk: () =>
                            handleRejectUserWithdrawalRequest(
                              data?.users[row?.no - 1].withdrawal_request_id ||
                              "",
                            ),
                        });
                      }}
                      className="group rounded-md border border-transparent bg-red-600 px-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("users_membership_status_reject")}
                    </button>
                  </div>
                </div>
              );
            case 2:
              return (
                <p
                  onClick={() => {
                    setWithdrawUserEmail(row?.email);
                    withdrawalModal.current?.open();
                  }}
                  className="underline cursor-pointer justify-center items-center"
                >
                  {loadingRejectUserWithdrawalRequest ? (
                    <Spinner />
                  ) : (
                    text("users_column_header_membership_withdrawal_complete")
                  )}
                </p>
              );
            default:
              return null;
          }
        },
      },
      {
        ...sharedColDef,
        field: "corporate_status",
        headerName: `${text("user_column_header_corporate_status")}`,
        minWidth: 160,
        renderCell: ({ row }) => {
          if (row.member_type === "corporate")
            return (
              <span className={"text-[#3b82f6]"}>
                {text("users_member_type_corporation")}
              </span>
            );

          if (row.member_type === "individual")
            return <span>{text("users_member_type_individual")}</span>;

          return <span>---</span>;
        },
      },
      {
        ...sharedColDef,
        field: "airdrop_status",
        headerName: `${text("user_column_header_airdrop_status")}`,
        minWidth: 160,
        renderCell: ({ value }) => {
          if (value === 1) {
            return (
              <span className="text-blue-500">
                {text("view_airdrop_history_status_yes")}
              </span>
            );
          } else {
            return (
              <span className="text-red-500">
                {text("view_airdrop_history_status_no")}
              </span>
            );
          }
        },
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: `${text("users_column_header_register_super_save")}`,
        minWidth: 160,
        renderCell: ({ value, row }) => {
          switch (value) {
            case 0:
              return (
                <p className="text-green-500">
                  {text("users_column_header_waiting_for_approval")}
                </p>
              );
            case 1:
              return (
                <p className="text-blue-500">{text("users_status_approved")}</p>
              );
            case 2:
              return (
                <>
                  <p
                    onClick={() => {
                      setRejectUserModal({
                        email: row.email,
                        usdt_modal: false,
                      });
                      rejectSuperUserRequestModal.current?.open();
                    }}
                    className="underline cursor-pointer text-orange-500"
                  >
                    {text("users_denial_of_approval")}
                  </p>
                </>
              );
            case 3:
              return (
                <p className="text-blue-500">
                  {text("users_status_completed")}
                </p>
              );
            default:
              return text("users_status_not_applicable");
          }
        },
      },

      {
        ...sharedColDef,
        field: "usdt_status",
        headerName: `${text("users_column_header_register_super_save_usdt")}`,
        minWidth: 200,
        renderCell: ({ value, row }) => {
          switch (value) {
            case 0:
              return (
                <p className="text-green-500">
                  {text("users_column_header_waiting_for_approval")}
                </p>
              );
            case 1:
              return (
                <p className="text-blue-500">{text("users_status_approved")}</p>
              );
            case 2:
              return (
                <>
                  <p
                    onClick={() => {
                      setRejectUserModal({
                        email: row.email,
                        usdt_modal: true,
                      });
                      rejectSuperUserRequestModal.current?.open();
                    }}
                    className="underline cursor-pointer text-orange-500"
                  >
                    {text("users_denial_of_approval")}
                  </p>
                </>
              );
            default:
              return text("users_status_not_applicable");
          }
        },
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: `${text("users_column_header_name")}`,
        minWidth: 150,
        renderCell: ({ row }) => {
          return row.member_type !== "corporate" && row.name ? (
            <p className="w-fit truncate">{row.name}</p>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "birth_date",
        headerName: `${text("users_column_header_birth_date")}`,
        minWidth: 100,
        renderCell: ({ value }) =>
          <DateFormatter value={value} breakLine showTime={false} /> || "---",
      },
      {
        ...sharedColDef,
        field: "phone",
        headerName: `${text("users_column_header_phone_number")}`,
        minWidth: 150,
        renderCell: ({ row }) => {
          return row.member_type !== "corporate"
            ? row?.phone_number || row?.usdt_phone_number || row?.phone || "---"
            : "---";
        },
      },
      {
        ...sharedColDef,
        field: "nationality",
        headerName: `${text("users_column_header_nationality")}`,
        minWidth: 150,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "bank_name",
        headerName: `${text("users_column_header_bank")}`,
        minWidth: 100,
        renderCell: ({ row }) => {
          return row.member_type !== "corporate" ? (
            <div>
              <span>{row.bank_name || "---"}</span>
            </div>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "bank_account_number",
        headerName: `${text("users_column_header_account_number")}`,
        minWidth: 150,
        renderCell: ({ row }) => {
          return row.member_type !== "corporate" ? (
            <div>
              <span>{row.bank_account_number || "---"}</span>
            </div>
          ) : (
            "---"
          );
        },
      },
      // {
      //   ...sharedColDef,
      //   field: "bank_account_holder_name",
      //   headerName: `${text("users_column_header_account_holder")}`,
      //   minWidth: 150,
      //   renderCell: ({ row, value }) => {
      //     return row.member_type !== "corporate" ? (<div>
      //       <span>{row.bank_account_holder_name || "---"}</span>
      //     </div>) : "---";
      //   },
      // },
      {
        ...sharedColDef,
        field: "corporate_name",
        headerName: `${text("user_column_header_corporate_name")}`,
        minWidth: 180,
        renderCell: ({ value }) => {
          return value || "---";
        },
      },
      {
        ...sharedColDef,
        field: "business_registration_number",
        headerName: `${text("user_column_header_corporate_reg_no")}`,
        minWidth: 250,
        renderCell: ({ value }) => {
          return value || "---";
        },
      },
      {
        ...sharedColDef,
        field: "business_registration_file",
        headerName: `${text("user_column_header_business_registration")}`,
        minWidth: 250,
        headerAlign: "center",

        renderCell: ({ value }) => {
          return value ? (
            <a href={value} className="flex w-full justify-center items-center">
              <Tooltip title="PDF Download">
                <IconButton>
                  <CloudDownloadIcon
                    sx={{ display: "block!important", color: "#808080" }}
                  />
                </IconButton>
              </Tooltip>
            </a>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "corporate_bank",
        headerName: `${text("user_column_header_corporate_bank")}`,
        minWidth: 200,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? (
            <div>
              <span>{row.bank_name || "---"}</span>
            </div>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "corporate_bank_account_no",
        headerName: `${text("user_column_header_corporate_bank_account_no")}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? (
            <div>
              <span>{row.bank_account_number || "---"}</span>
            </div>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "corporate_bank_account_holder",
        headerName: `${text(
          "user_column_header_corporate_bank_account_holder",
        )}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? (
            <div>
              <span>{row.bank_account_holder_name || "---"}</span>
            </div>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "bank_statement_file",
        headerName: `${text("user_column_header_corporate_bankbook")}`,
        minWidth: 250,
        headerAlign: "center",
        renderCell: ({ value }) => {
          return value ? (
            <a href={value} className="flex w-full justify-center items-center">
              <Tooltip title="PDF Download">
                <IconButton>
                  <CloudDownloadIcon
                    sx={{ display: "block!important", color: "#808080" }}
                  />
                </IconButton>
              </Tooltip>
            </a>
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "corporate_representative",
        headerName: `${text("user_column_header_corporate_representative")}`,
        minWidth: 200,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? row?.name : "---";
        },
      },
      {
        ...sharedColDef,
        field: "corporate_phone",
        headerName: `${text("user_column_header_corporate_contract_info")}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? row?.phone_number : "---";
        },
      },
      {
        ...sharedColDef,
        field: "corporate_email",
        headerName: `${text("user_column_header_corporate_contract_email")}`,
        minWidth: 200,
        renderCell: ({ row }) => {
          return row.member_type === "corporate" ? row?.corporate_emali : "---";
        },
      },
      {
        ...sharedColDef,
        field: "wallet_id",
        headerName: `${text("users_column_header_usdt_wallet")}`,
        minWidth: 150,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "offChainAddress",
        headerName: `${text("users_column_header_offChain_address")}`,
        minWidth: 200,
        width: 150,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full justify-between">
              <p className="truncate">{value}</p>
              <Image
                onClick={() => copyToClipboard(value)}
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
              />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "onChainAddress",
        headerName: `${text("users_column_header_onChain_address")}`,
        minWidth: 200,
        width: 150,
        renderCell: ({ value }) =>
          value ? (
            <div className="flex w-full justify-between">
              <p className="truncate">{value}</p>
              <Image
                onClick={() => copyToClipboard(value)}
                className="ml-5 cursor-pointer"
                width={19}
                height={19}
                src="/images/copy-icon.svg"
                alt="Copy Icon"
              />
            </div>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "userSignUpDate",
        headerName: `${text("users_column_header_registration_date")}`,
        minWidth: 150,
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "userCreatedBy",
        headerName: `${text("users_column_header_created_by")}`,
        minWidth: 150,
        renderCell: () => (
          <span className="whitespace-normal w-fit ">User</span>
        ),
      },
      {
        ...sharedColDef,
        field: "userUpdatedDate",
        headerName: `${text("users_column_header_updated_date")}`,
        minWidth: 150,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "userUpdatedBy",
        headerName: `${text("users_column_header_updated_by")}`,
        minWidth: 150,
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ) : (
            "---"
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail, loadingRejectUserWithdrawalRequest, data?.users],
  );

  const usersWithIndex = useMemo(
    () =>
      data?.users?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [],
    [data?.users, limit, page],
  );
  const removeColumns = useMemo(() => {
    return columns.filter(
      (column) => !colRemoved.includes(column.field as string),
    );
  }, [colRemoved, columns]);

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("supersaveUserColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div ref={divRef} className="h-auto px-5 py-5">
      <div className="w-full pb-5 platforms-header mb-1 md:mb-2">
        <h4 className="text-2xl font-medium">{text("users_title")}</h4>
        <span className="text-slate-500 text-sm">{text("users_detail")}</span>

        <div className="flex border w-full md:w-[400px] h-[40px] text-center items-center mt-8  cursor-pointer">
          <div
            className={clsx(
              "flex-1 border-r h-[100%] flex items-center justify-center",
              dataFilter?.memberType === undefined ||
                dataFilter?.memberType === "all"
                ? "text-[#FFFFFF] bg-[#3B82F6]"
                : "",
            )}
            onClick={() => {
              // setMemberType(undefined)
              handleDataFilterChange({
                ...dataFilter,
                memberType: undefined,
              });
              setLimit(25);
            }}
          >
            {text("users_member_type_all")}
          </div>
          <div
            className={clsx(
              "flex-1 border-r h-[100%] flex items-center justify-center",
              dataFilter?.memberType === "individual"
                ? "text-[#FFFFFF] bg-[#3B82F6]"
                : "",
            )}
            onClick={() => {
              // setMemberType("individual");
              handleDataFilterChange({
                ...dataFilter,
                memberType: "individual",
              });
              setLimit(25);
              // setColRemoved(["corporate_name","business_registration_number",
              //   "business_registration_file","corporate_bank","corporate_bank_account_no",
              //   "corporate_bank_account_holder","bank_statement_file","corporate_representative",
              //   "corporate_phone","corporate_email"]);
            }}
          >
            {text("users_member_type_individual")}
          </div>
          <div
            className={clsx(
              "flex-1 h-[100%] flex items-center justify-center",
              dataFilter?.memberType === "corporate"
                ? "text-[#FFFFFF] bg-[#3B82F6]"
                : "",
            )}
            onClick={() => {
              // setMemberType("corporate");
              handleDataFilterChange({
                ...dataFilter,
                memberType: "corporate",
              });
              setLimit(25);
              // setColRemoved(["name","birth_date","phone","nationality","bank_name",
              // "bank_account_number","bank_account_holder_name"]);
            }}
          >
            {text("users_member_type_corporation")}
          </div>
        </div>

        {/* {
          !isBigScreen && <div className={"flex justify-between pt-5"}>
            <ShowEmail />
            <FilterButton
              onClick={() => {
                setFilterMobileDrawerOpen(true);
              }}
            />
          </div>
        } */}
      </div>

      <div className="flex min-h-full flex-col 2xl:flex-row gap-1 overflow-x-auto pt-2 custom_scroll_bar">
        <FiltersWrapper
          handleDataFilterChange={handleDataFilterChange}
          isUserScreen={true}
        />
      </div>

      <div className="flex gap-1 flex-wrap justify-between items-center py-4 md:py-3">
        <div className="flex gap-2 flex-wrap items-end">
          <CommunityLinkButtons />

          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex flex-wrap">
          {usersWithIndex.length > 0 && (
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
          )}
          {usersWithIndex.length > 0 && (
            <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
          )}
          <button
            id={htmlIds.btn_users_excel_download}
            disabled={massDownloadLoading || !data?.users?.length}
            onClick={() => {
              getMassUsers(
                {
                  searchKey: dataFilter?.searchKey,
                  from_date: dataFilter?.startDate,
                  to_date: dataFilter?.endDate,
                  status:
                    dataFilter?.status === "all"
                      ? undefined
                      : dataFilter?.status,
                  usdt_status:
                    dataFilter?.usdt_status === "all"
                      ? undefined
                      : dataFilter?.usdt_status,
                  member_type:
                    dataFilter?.memberType === "all"
                      ? undefined
                      : dataFilter?.memberType,
                  super_trust_status:
                    dataFilter?.super_trust_status === "all"
                      ? undefined
                      : dataFilter?.super_trust_status,
                  super_save_community:
                    dataFilter?.super_save_community === "all"
                      ? undefined
                      : dataFilter?.super_save_community,
                  super_save_restriction:
                    dataFilter?.super_save_restriction === "all"
                      ? undefined
                      : dataFilter?.super_save_restriction,
                },
                {
                  onSuccess: (_data) => {
                    _data.users && handleExcelDownload(_data?.users);
                  },
                },
              );
            }}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {massDownloadLoading && <Spinner />}{" "}
            <span>{text("users_excel_download_title")}</span>
          </button>
        </div>
      </div>
      <div
        id={htmlIds.div_users_table_container}
        className="w-full bg-white tableContainer"
      >
        <DataGridPro
          getRowId={(row) => row.id ?? row.no}
          rows={usersWithIndex}
          columns={removeColumns}
          paginationMode="server"
          loading={
            isLoading || loadingRejectUserWithdrawalRequest || isRefetching
          }
          rowCount={usersWithIndex.length}
          sx={customisedTableClasses}
          hideFooter
          disableSelectionOnClick
          autoHeight={!isLoading}
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
          totalPages={data?.nbTotalPage}
          isFetching={isLoading}
        />
      </div>
      <WithdrawalModal
        onSave={refetch}
        email={withdrawUserEmail}
        ref={withdrawalModal}
      />
      <RejectSuperSaveModal
        onSave={refetch}
        rejectSuperSaveData={rejectSuperSaveData}
        ref={rejectSuperSaveModal}
      />
      <RejectSuperUserRequestModal
        email={rejectUserModal.email}
        ref={rejectSuperUserRequestModal}
        usdt_modal={rejectUserModal.usdt_modal}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <UpdateCommunityModal
        refetch={refetch}
        userId={selectedUser?.id}
        open={showUpdateTeamModal}
        onClose={() => setShowUpdateTeamModal(false)}
        community={selectedUser?.community}
      />
    </div>
  );
}

export default SuperSaveUsersScreen;
