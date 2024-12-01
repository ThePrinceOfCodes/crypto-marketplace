/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataFilterType,
  DateFormatter,
  LanguageSelectedTab,
  Pagination,
  ShowEmail,
  Spinner,
} from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import {
  arrayToString,
  getLocalStorageState,
  resetMUIToolbarFilter,
  showSortingPageNotification,
  useCopyToClipboard,
} from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import { CurrencyType } from "@sections/super-save";
import {
  IWithdrawal,
  useGetMassWithdrawals,
  useGetMassWithdrawRequests,
  useGetWithdrawals,
  usePostAdminHistoryLog,
  useSetWithdrawalCompleteByDate,
  useWithdrawalComplete,
} from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import Image from "next/image";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  MarkCompleteModal,
  MarkCompleteModalRef,
  MassExcelDownloadModal,
  MassExcelDownloadModalRef,
} from "./components";
import { useTimezone } from "@common/hooks";
import { allBanks } from "./bankCodes";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import useResponsive from "@common/hooks/useResponsive";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { jsonToExcelDownload } from "@common/utils/excelutil";

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
  {
    label: "withdrawal_information_withdrawal_completed",
    value: "withdrawal_completed",
  },
];

function WithdrawalInformationScreen({
  user_id,
  transaction_id,
  type = "page",
  currency = "",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_id?: any;
  transaction_id?: string;
  type?: "page" | "tab";
  currency?: CurrencyType;
}) {
  const copyToClipboard = useCopyToClipboard();
  const excelDownloadModalRef = useRef<MassExcelDownloadModalRef>(null);
  const markCompleteModalRef = useRef<MarkCompleteModalRef>(null);

  const divRef = useRef<HTMLDivElement>(null);
  const { text } = useLocale();
  const { timezone } = useTimezone();

  const [status, setStatus] = useState("unselected");
  const { confirmDialog, alertDialog } = useDialog();

  const [showEmail, setShowEmail] = useState(false);
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortModel, setSortModel] = useState<GridSortModel>();
  const [selectedLang, setSelectedLang] = useState({
    label: text("korean_currency_name"),
    type: currency?.length ? currency : "KRW",
    alert: text("alert_text_for_korean_currency"),
  });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const {
    isLoading: isDataLoading,
    isFetching,
    data,
    refetch,
  } = useGetWithdrawals(
    {
      user_id: user_id,
      type: selectedLang.type,
      transaction_id,
      limit,
      searchKey:
        (dataFilter?.searchKey?.trim()?.length || 0) > 0
          ? dataFilter?.searchKey
          : undefined,
      startDate: dataFilter?.startDate,
      endDate: dataFilter?.endDate,
      page,
      sort_column_name: sortModel?.[0]?.field,
      sort_type: sortModel?.[0]?.sort
        ? sortModel?.[0]?.sort === "asc"
          ? "asc"
          : "desc"
        : undefined,
    },
    {
      enabled:
        type === "page" || (type === "tab" && (!!user_id || !!transaction_id)),
    },
  );

  const { mutateAsync: getMassWithdrawals, isLoading: massDownloadLoading } =
    useGetMassWithdrawRequests();
  const { mutateAsync: getMassTransferWithdrawals } = useGetMassWithdrawals();
  const { mutateAsync: setCompleteWithdrawal } = useWithdrawalComplete();
  const { mutateAsync: setWithdrawalCompleteByDate } =
    useSetWithdrawalCompleteByDate();

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    !currency?.length &&
      setSelectedLang({
        type: "KRW",
        label: text("korean_currency_name"),
        alert: text("alert_text_for_korean_currency"),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const handleExcelDownload = (data: IWithdrawal[]) => {
    jsonToExcelDownload(
      data.map((item, index) => ({
        [text("withdrawal_information_header_no")]: index + 1,
        [text("withdrawal_information_header_name")]: item.user_name,
        [text("withdrawal_information_header_super_save_request_id")]:
          item.super_save_request_id,
        [text("withdrawal_information_header_user_id")]: item.user_id,
        [text("withdrawal_information_header_email")]: item.user_email,
        [text("withdrawal_information_header_phone")]: item.user_phone_number,
        [text("withdrawal_information_header_payment_date")]: formatDateAndTime(
          item.week_started_date,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
        [text("withdrawal_information_header_repayment_date")]:
          formatDateAndTime(
            item.week_end_date,
            "YYYY-MM-DD HH:mm:ss",
            timezone,
          ),
        [text("withdrawal_information_header_application_date")]:
          item.payment_period,
        [text("withdrawal_information_header_payment_application_round")]:
          item.payment_count_around,
        [text("withdrawal_information_header_payment_count_days")]:
          item.payment_count_around_in_days,
        [text("withdrawal_information_header_amount_of_credit")]:
          item.total_payout_amount,
        [text("withdrawal_information_header_daily_payment")]:
          item.daily_payout_amount,
        [text("withdrawal_information_header_weekly_payment")]:
          item.weekly_payout_amount,
        [text("withdrawal_information_header_bank_fee")]: item?.bank_fee,
        [text("withdrawal_information_header_deducted_payment")]:
          item?.weekly_payout_amount - item?.bank_fee,
        [selectedLang?.type === "USDT"
          ? text("withdrawal_information_header_usdt_tab_wallet_type")
          : text("withdrawal_information_header_withdrawal_bank")]:
          item.bank_name,
        [selectedLang?.type === "USDT"
          ? text("withdrawal_information_header_usdt_tab_wallet_id")
          : text("withdrawal_information_header_account_number")]:
          item.bank_account_number,
        [text("withdrawal_information_header_transaction_id")]: item.unique_id,
        [text("withdrawal_information_header_withdrawal_status")]: item.is_paid
          ? text("withdrawal_information_status_withdrawal_complete")
          : text("withdrawal_information_status_waiting_for_withdrawal"),
        [text("withdrawal_information_header_withdrawal_date")]:
          formatDateAndTime(item.action_date, "YYYY-MM-DD HH:mm:ss", timezone),
        [text("withdrawal_information_header_manager")]: item.action_by,
      })),
      `${arrayToString([
        text("withdrawal_information_header_withdrawals"),
        formatDate(new Date(), false),
        selectedLang.type,
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("withdrawal_information_header_withdrawals"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  const getBankNameByBankCode = (
    bank_code: string,
    bankBackendName: string,
  ) => {
    const currentBank = allBanks.find((item) => item.bankCode === bank_code);
    if (currentBank) {
      return currentBank.bankName;
    }
    return bankBackendName;
  };

  const getExcelColumnByBankFormat = (
    item: IWithdrawal,
    selectedBankFormat?: string,
  ) => {
    switch (selectedBankFormat) {
      case "suhyup_bank":
        return {
          입금은행: `${getBankNameByBankCode(item.bank_code, item.bank_name) || ""
            }`,
          입금계좌: `${item.bank_account_number}`,
          입금계좌예금주: `${item.user_name}`,
          입금액: `${(item.weekly_payout_amount || 0) - (item.bank_fee || 0)}`,
          CMS코드: `${item.unique_id}`,
          받는분통장표시내용: "슈퍼세이브",
          보내는분통장표시내용: "슈퍼세이브",
          적요: "슈퍼세이브",
        };
      case "hana_bank":
        return {
          입금은행: `${item.bank_code || ""}`,
          입금계좌번호: `${item.bank_account_number}`,
          입금액: `${(item.weekly_payout_amount || 0) - (item.bank_fee || 0)}`,
          예상예금주: `${item.user_name}`,
          입금통장표시: "슈퍼세이브",
          출금통장표시: "슈퍼세이브",
          메모: "슈퍼세이브",
          CMS코드: `${item.unique_id}`,
          "받는분 휴대폰번호": `${item.user_phone_number}`,
        };
      default: // shinhan_bank
        return {
          입금은행: `${item.bank_code || ""}`,
          입금계좌: `${item.bank_account_number}`,
          고객관리성명: `${item.user_name}`,
          입금액: `${(item.weekly_payout_amount || 0) - (item.bank_fee || 0)}`,
          출금통장표시내용: `${item.user_name}`,
          입금통장표시내용: "슈퍼세이브",
          입금인코드: `${item.unique_id}`,
          비고: "슈퍼세이브",
          업체사용Key: "슈퍼세이브",
          전화번호: `${item.user_phone_number}`,
          "사용자계정(e-mail)": `${item.user_email}`,
        };
    }
  };

  const getSelectedBankFormatLabel = (selectedBankFormat?: string) => {
    switch (selectedBankFormat) {
      case "suhyup_bank":
        return text("withdrawal_information_bank_suhyup_bank");
      case "hana_bank":
        return text("withdrawal_information_bank_hana_bank");
      default: // shinhan_bank
        return text("withdrawal_information_bank_shinhan_bank");
    }
  };

  const handleTransferExcelDownload = (
    data: IWithdrawal[],
    date: string,
    selectedBankFormat?: string,
  ) => {
    const selectedBankFormatLabel =
      getSelectedBankFormatLabel(selectedBankFormat);
    jsonToExcelDownload(
      data.map((item) => getExcelColumnByBankFormat(item, selectedBankFormat)),
      `${arrayToString([
        selectedLang.type === "USDT" ? text("withdrawal_information_blockchain_file_name")  : selectedBankFormatLabel,
        text("withdrawal_information_header_transfers"),
        date,
        selectedLang.type,
      ])}`,
      selectedBankFormat == "suhyup_bank" ? true : false,
      selectedBankFormat == "shinhan_bank" ? ".xlsx" : ".xls",
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        selectedBankFormatLabel,
        text("withdrawal_information_header_transfers"),
        formatDate(new Date()),
        selectedLang.type +
        (selectedBankFormat == "shinhan_bank" ? ".xlsx" : ".xls"),
      ]),
    });
  };

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const handleLanguageChange = (
    event: React.ChangeEvent<object>,
    newValue: CurrencyType,
  ) => {
    const label = (event.currentTarget as HTMLElement).innerText;
    setSelectedLang({
      type: newValue,
      label,
      alert:
        newValue === "USDT"
          ? text("alert_text_for_global_currency")
          : text("alert_text_for_korean_currency"),
    });
    setPage(1);
    setLimit(25);
  };

  const notBackendSortColumns = [
    "no",
    "user_name",
    "user_email",
    "user_phone_number",
    "payment_count_around_in_days",
    "rest_of_days",
    "weekly_payout_amount",
    "deducted_payout_amount",
    "unique_id",
  ];

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: `${text("withdrawal_information_header_no")}`,
        minWidth: 60,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "super_save_request_id",
        headerName: text("withdrawal_information_header_super_save_request_id"),
        minWidth: 200,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit truncate text-ellipsis">{value}</span>
              <Image
                className="cursor-pointer mr-5"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "user_name",
        headerName: text("withdrawal_information_header_name"),
        minWidth: 200,
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "user_id",
        headerName: text("withdrawal_information_header_user_id"),
        minWidth: 200,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit truncate text-ellipsis">{value}</span>
              <Image
                className="cursor-pointer mr-5"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "user_email",
        headerName: text("withdrawal_information_header_email"),
        minWidth: 250,
        filterable: !!showEmail,
        sortable: !!showEmail,
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
        field: "user_phone_number",
        headerName: text("withdrawal_information_header_phone"),
        minWidth: 150,
      },
      {
        ...sharedColDef,
        field: "week_started_date",
        headerName: text("withdrawal_information_header_payment_date"),
        minWidth: 200,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "week_end_date",
        headerName: text("withdrawal_information_header_repayment_date"),
        minWidth: 200,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "payment_period",
        headerName: text("withdrawal_information_header_application_date"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value} {text("withdrawal_information_days")}
          </div>
        ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "super_save_start_date",
        headerName: text("withdrawal_information_header_start_date"),
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "super_save_end_date",
        headerName: text("withdrawal_information_header_end_date"),
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "payment_count_around_in_days",
        headerName: text("withdrawal_information_header_payment_count_days"),
        minWidth: 150,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "rest_of_days",
        headerName: text("withdrawal_information_header_rest_days"),
        minWidth: 150,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "week_no",
        headerName: text(
          "withdrawal_information_header_payment_application_round",
        ),
        minWidth: 150,
        type: "number",
        renderCell: ({ row }) => `${row.week_no}/${row.total_week_days}`,
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "total_payout_amount",
        headerName: text("withdrawal_information_header_amount_of_credit"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)} {selectedLang.label}
          </div>
        ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "daily_payout_amount",
        headerName: text("withdrawal_information_header_daily_payment"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value, 3)} {selectedLang.label}
          </div>
        ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "weekly_payout_amount",
        headerName: text("withdrawal_information_header_weekly_payment"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value, 3)} {selectedLang.label}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "bank_fee",
        headerName: text("withdrawal_information_header_bank_fee"),
        minWidth: 150,
        type: "number",
        renderCell: ({ value, row }) => (
          <div>
            {row?.weekly_payout_amount
              ? formatNumberWithCommas(value, 3) + " " + selectedLang.label
              : "---"}
          </div>
        ),
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "deducted_payout_amount",
        headerName: text("withdrawal_information_header_deducted_payment"),
        minWidth: 150,
        type: "number",
        renderCell: ({ row }) => (
          <div>
            {row?.weekly_payout_amount
              ? formatNumberWithCommas(
              row?.weekly_payout_amount - row?.bank_fee,
              3,
            ) +
            " " +
            selectedLang.label
            : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "bank_name",
        headerName:
          selectedLang?.type === "USDT"
            ? text("withdrawal_information_header_usdt_tab_wallet_type")
            : text("withdrawal_information_header_withdrawal_bank"),
        minWidth: 150,
        renderCell: ({ value }) => value || "---",
        sortable: true,
      },
      {
        ...sharedColDef,
        field: "bank_account_number",
        headerName:
          selectedLang?.type === "USDT"
            ? text("withdrawal_information_header_usdt_tab_wallet_id")
            : text("withdrawal_information_header_account_number"),
        minWidth: 150,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "unique_id",
        headerName: text("withdrawal_information_header_transaction_id"),
        minWidth: 200,
        sortable: true,
        renderCell: ({ value }) =>
          value ? (
            <div className="flex items-center">
              <span className="w-[150px] truncate text-ellipsis">{value}</span>
              {!transaction_id && (
                <Link
                  href={
                    "/super-save/transaction-details?tId=" +
                    value +
                    `&type=${selectedLang.type}`
                  }
                >
                  <Image
                    width={17}
                    height={17}
                    src="/images/navigate-icon.svg"
                    alt="Navigate Icon"
                  />
                </Link>
              )}
            </div>
          ) : (
            "---"
          ),
      },
      {
        minWidth: 155,
        ...sharedColDef,
        field: "is_paid",
        headerName: text("withdrawal_information_header_withdrawal_status"),
        type: "boolean",
        renderCell: ({ value }) => {
          if (!value) {
            return (
              <div className="text-green-500">
                {text("withdrawal_information_status_waiting_for_withdrawal")}
              </div>
            );
          } else if (value) {
            return (
              <div className="text-blue-500">
                {text("withdrawal_information_status_withdrawal_complete")}
              </div>
            );
          } else {
            return null;
          }
        },
      },
      {
        ...sharedColDef,
        field: "action_date",
        headerName: text("withdrawal_information_header_withdrawal_date"),
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <p className="truncate">
              <DateFormatter value={value} breakLine />
            </p>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("withdrawal_information_header_manager"),
        minWidth: 200,
        renderCell: ({ value }) => value || "---",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      text,
      showEmail,
      selectedLang.label,
      selectedLang.type,
      transaction_id,
      isFetching,
    ],
  );

  const handleSave = () => {
    const withdrawalsCount = rowSelectionModel.length;
    const withdrawText = withdrawalsCount > 1 ? "withdrawal_information_withdrawals" : "withdrawal_information_withdrawal";
    confirmDialog({
      title: `${text("withdrawal_information_withdrawal_complete")}  ${withdrawalsCount > 1 ? withdrawalsCount : ""} ${text(withdrawText)}?`,
      content: `${text("withdrawal_information_complete_warning_msg")} ${
        withdrawalsCount === 1
          ? text("withdrawal_information_single_withdrawal_selected")
          : text("withdrawal_information_multiple_withdrawals_selected")
        }?  ${text("withdrawal_information_form_info_msg")} `,
      onOk: async () => {
        try {
          await setCompleteWithdrawal({
            withdrawal_ids: rowSelectionModel.join(","),
          });
          refetch();
          setRowSelectionModel([]);
          setStatus("unselected");
          toast.success(`${text(withdrawText)} ${text("withdrawal_information_withdrawal_success")}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(
            error?.response?.data?.result ||
            text("toast_error_something_went_wrong_try_again"),
          );
        }
      },
    });
  };

  const withdrawalsWithIndex = useMemo(() => {
    const withdrawals =
      data?.withdrawals?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [];
    return [...withdrawals];
  }, [data?.withdrawals, limit, page]);

  const handleDataFilterChange = useCallback((dataFilter: DataFilterType) => {
    setPage(1);
    setDataFilter(dataFilter);
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
  } = useGridColumnChange("withdrawalColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showEmail,
    selectedLang.label,
    selectedLang.type,
    transaction_id,
    isFetching,
  ]);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div ref={divRef} className="h-full overflow-y-auto px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("withdrawal_information_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("withdrawal_information_detail")}
        </span>
        {currency === "" && (
          <div className={"mt-5"}>
            <LanguageSelectedTab
              selectedLang={selectedLang}
              handleLanguageChange={handleLanguageChange}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end min-[1400px]:justify-between">
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
        <Link href={"withdrawal-information/bulk-transfer"} >
          <button
            id={htmlIds.btn_massExcel_modal_display_open}
            className="flex items-center justify-center text-sm px-4 ml-2 min-[1400px]:ml-0 h-10 bg-blue-500 text-white rounded-md"
          >
            <span>{text("withdrawal_information_bulk_transfer_button")}</span>
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 justify-end items-center py-3">
        {Object.keys(columnCurrentState).length > 0 && (
          <SaveNResetButtons
            saveHandler={() => setOpenConfirmDialog(true)}
            resetHandler={handleResetDefault}
          />
        )}
        <ShowToolbar
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
        <div className="flex gap-1">
          <p className="text-neutral-500 text-[12px] md:text-base">{`${rowSelectionModel.length}`}</p>
          <span className="text-neutral-500 hidden md:flex"> selected </span>
        </div>
        <p className="text-neutral-500 text-[12px] md:hidden"> rows </p>
        <Select
          className="bg-gray-50  h-11 w-[220px] text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600"
          inputProps={{ "aria-label": "Without label" }}
          MenuProps={MenuProps}
          defaultValue={status}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={!rowSelectionModel.length}
        >
          <MenuItem disabled value="unselected">
            <em>{text("withdrawal_information_change_information_status")}</em>
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
          disabled={!rowSelectionModel.length || status === "unselected"}
          onClick={handleSave}
          className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
        >
          <span>{text("withdrawal_information_save_title")}</span>
        </button>

        <button
          id={htmlIds.btn_withdrawal_excel_download}
          disabled={massDownloadLoading || (data?.withdrawals || [])?.length <= 0}
          onClick={() => {
            getMassWithdrawals(
              {
                searchKey: dataFilter?.searchKey,
                startDate: dataFilter?.startDate,
                endDate: dataFilter?.endDate,
                type: selectedLang.type,
                ...(user_id ? { user_id: user_id } : {})
              },
              {
                onSuccess: (res) => {
                  res.withdrawals.length &&
                    handleExcelDownload(res.withdrawals);
                },
              },
            );
          }}
          className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
        >
          {massDownloadLoading && <Spinner />}{" "}
          <span>{text("withdrawal_information_excel_download")}</span>
        </button>

        {!user_id && !transaction_id && (
          <button
            id={htmlIds.btn_allTransfers_modal_display_open}
            onClick={() => markCompleteModalRef.current?.open()}
            className={`flex items-center justify-center text-sm px-4 h-10 ${selectedLang.type === "USDT" ? "bg-red-500" : "bg-blue-500"} text-white rounded-md`}
          >
            <span>{text(selectedLang.type === "USDT" ? "withdrawal_information_send_all_transfers_button" :"withdrawal_information_complete_button")}</span>
          </button>
        )}

        {!user_id && !transaction_id && (
          <button
            id={htmlIds.btn_massExcel_modal_display_open}
            onClick={() => excelDownloadModalRef.current?.open()}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
          >
            <span>{text("withdrawal_information_mass_excel_download")}</span>
          </button>
        )}

        <MarkCompleteModal
          alert={selectedLang.alert}
          ref={markCompleteModalRef}
          onClose={() => null}
          onOk={(date) =>
            setWithdrawalCompleteByDate(
              { repayment_date: date, type: selectedLang.type },
              {
                onSuccess: () => {
                  refetch();
                  toast.success(text("withdrawal_information_complete_toast"));
                },
              },
            )
          }
          title={selectedLang.type === "USDT" ? text("withdrawal_information_send_all_transfers_button") :  text("withdrawal_information_complete_button")}
        />
        <MassExcelDownloadModal
          isKRW={selectedLang.type === "KRW"}
          alert={selectedLang.alert}
          ref={excelDownloadModalRef}
          onClose={() => null}
          onOk={(date, is_unpaid, selectedBankFormat) =>
            getMassTransferWithdrawals(
              { repayment_date: date, is_unpaid, type: selectedLang.type },
              {
                onSuccess: (res, { repayment_date }) => {
                  if (res.withdrawals.length) {
                    handleTransferExcelDownload(
                      res.withdrawals,
                      repayment_date,
                      selectedBankFormat,
                    );
                  } else {
                    toast(
                      text("withdrawal_information_mass_excel_download_toast"),
                    );
                  }
                },
              },
            )
          }
          title="withdrawal_information_mass_excel_download"
        />
      </div>

      <div
        id={htmlIds.div_users_table_container}
        className="w-full bg-white tableContainer"
      >
        <DataGridPro
          getRowId={(row) => row?.uuid}
          rows={withdrawalsWithIndex}
          columns={columns}
          loading={isDataLoading || isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={withdrawalsWithIndex.length}
          checkboxSelection
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          isRowSelectable={(row) => !row.row?.is_paid}
          autoHeight={!isDataLoading}
          onSortModelChange={(e) => {
            if (e && e.length > 0) {
              if (notBackendSortColumns.includes(e[0].field)) {
                handleColumnChange(true);
              } else {
                setPage(1);
                setSortModel(e);
              }
            }
          }}
          // sortModel={sortModel}
          // sortingMode="server"
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
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
          isFetching={isDataLoading}
          totalPages={data?.nbTotalPage}
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

export default WithdrawalInformationScreen;
