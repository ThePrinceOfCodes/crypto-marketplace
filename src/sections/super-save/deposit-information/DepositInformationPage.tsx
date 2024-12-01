/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataFilterType,
  Spinner,
  Pagination,
  FilterButton,
  DataFilterWrapper,
  DateFormatter,
} from "@common/components";
import { ShowEmail } from "@common/components/ShowEmail";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import useResponsive from "@common/hooks/useResponsive";
import CloseIcon from "@common/icons/CloseIcon";
import TransferIcon from "@common/icons/TransferIcon";
import { PlusIcon } from "@heroicons/react/24/outline";
import TXIDModal from "@sections/super-save/deposit-information/components/TXIDModal/TXIDModal";
import { TXIDModalType } from "@sections/super-save/deposit-information/components/TXIDModal/types";
import {
  useGetDepositRequests,
  useGetMassDepositRequests,
  useApproveDepositRequest,
  useRejectDepositRequest,
  IDepositRequest,
  usePostAdminHistoryLog,
  useRevokeDepositRequest,
  useGetSettings,
  useCheckBulkTxidOnBlockchain,
  ICheckBulkTxidOnBlockChainResult,
} from "api/hooks";
import {
  useCopyToClipboard,
  arrayToString,
  truncateString,
  getLocalStorageState,
  determineRequestType,
  showSortingPageNotification,
  determineAppDisplayTokenAmount,
  resetMUIToolbarFilter,
  parseIntroducerInfo,
} from "@common/utils/helpers";
import {
  Select,
  MenuItem,
  ListItemText,
  Box,
  IconButton,
  Alert,
  Chip,
  NativeSelect,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  DataGridPro,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridCellParams,
  GridColDef,
  GridFeatureMode,
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterModel,
  GridFilterOperator,
  GridSelectionModel,
  GridSortItem,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import clsx from "clsx";
import { LocalKeys, useLocale } from "locale";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import LanguageSelectedTab from "../../../common/components/LanguageSelectedTab/LanguageSelectedTab";
import {
  PaymentApplyModalRef,
  PaymentApplyModal,
  TransferOwnerShipModal,
} from "./components";
import Image from "next/image";
import {
  formatDate,
  formatDateAndTime,
  formatNumberWithCommas,
} from "@common/utils/formatters";
import { toast } from "react-toastify";
import { htmlIds } from "@cypress/utils/ids";
import { api, queryClient } from "api";
import Tooltip from "@mui/material/Tooltip";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import {
  CheckIntroducerInfoModal,
  CheckIntroducerInfoModalRef,
} from "@sections/super-save/deposit-information/components/CheckIntroducerInfoModal";
import {
  IntroducerInfoDepositDetails,
  IntroducerInfoObj,
} from "@sections/super-save/deposit-information/components/CheckIntroducerInfoModal/CheckIntroducerInfoModal";
import { useTimezone } from "@common/hooks";
import CheckTXIDCell from "./components/CheckTXIDCell/CheckTXIDCell";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import Link from "next/link";
import { useRouter } from "next/router";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { debounce } from "lodash";
import SelectField from "@common/components/FormInputs/SelectField";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import { PaymentApprovalModal, PaymentApprovalModalRef } from "./components/PaymentApprovalModal";

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
  { label: "deposit_information_dropDown_status_approval", value: "approved" },
  { label: "deposit_information_dropDown_approval_rejected", value: "reject" },
];

const sortOptions = [
  {
    label: "deposit_information_sort_on",
    value: "on",
  },
  {
    label: "deposit_information_sort_off",
    value: "off",
  }
];

function PaymentInformationScreen({ user_id }: { user_id?: string }) {
  const copyToClipboard = useCopyToClipboard();
  const { isMobile, isDesktop, isTablet, isBigScreen } =
    useResponsive();
  const [filterMobileDrawerOpen, setFilterMobileDrawerOpen] =
    useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const { text } = useLocale();
  const router = useRouter();
  const { timezone } = useTimezone();
  const [status, setStatus] = useState("unselected");
  const { confirmDialog, alertDialog } = useDialog();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showEmail, setShowEmail] = useState(false);
  const [validTxIdRequests, setValidTxIdRequests] = useState<
    ICheckBulkTxidOnBlockChainResult[]
  >([]);
  const [txIdsToRequest, setTxIdsToRequest] = useState<string[]>([]);
  const [transferOwnerShipModalOpen, setTransferOwnerShipModalOpen] = useState({
    open: false,
    requestId: "",
  });
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [muiFilters, setMuiFilters] = useState<GridFilterModel>();
  const [linkOperator, setLinkOperator] = useState<"and" | "or">("and");
  const [filterArr, setFilterArr] = useState<GridFilterItem[]>([]);
  const [sortMode, setSortMode] = useState<GridFeatureMode | undefined>("client");
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: router?.query.sort_column_name as string,
      sort: router?.query.sort_type as GridSortItem["sort"],
    },
  ]);
  const [firstSort, setFirstSort] = useState<boolean>(true);
  const [firstOrder, setFirstOrder] = useState<boolean>(true);
  const [viewSort, setViewSort] = useState("on");
  const [initialState, setInitialState] = useState<any>({});
  const [modelReason, setModelReason] = useState<string>("");

  const [selectedLang, setSelectedLang] = useState({
    label: text("deposit_information_krw_suffix"),
    type: "KRW",
  });

  const [tXIDModal, setTXIDModal] = useState<TXIDModalType>({
    open: false,
    modalTitle: "",
    id: "",
    label: "",
    name: "deposit_transaction_id",
    requestId: "",
  });

  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const [introducerDepositDetails, setIntroducerDepositDetails] =
    useState<IntroducerInfoDepositDetails>({
      uuid: "",
      name: "",
      email: "",
      credit_sale_permission: null,
      super_save_count: null,
      created_by: null,
      community_permission: null,
      introducer_info: [],
    });

  const { mutateAsync: revokeDepositRequest } = useRevokeDepositRequest();
  const {
    mutateAsync: checkbulkTxidOnBlockchainRequest,
    isLoading: checkBulkOnBlockChainLoading,
  } = useCheckBulkTxidOnBlockchain();

  const { isLoading, isFetching, data, refetch } = useGetDepositRequests({
    user_id: user_id,
    type: selectedLang.type,
    limit,
    searchKey:
      (dataFilter?.searchKey?.length || 0) > 0
        ? dataFilter?.searchKey
        : undefined,
    from_date: dataFilter?.startDate,
    to_date: dataFilter?.endDate,
    status: dataFilter?.status,
    page,
    sort_type: dataFilter?.sort_type,
    sort_column_name: dataFilter?.sort_column_name,
    filter_condition: (filterArr.length && filterArr?.length > 1) ? linkOperator : undefined,
    search_by: filterArr?.map((item) => {
      return {
        search_key: item.columnField,
        search_value: item.value,
        op: item.operatorValue,
      };
    }).filter((item) => !!item?.search_value),
    community:
      dataFilter?.community === "all"
        ? undefined
        : dataFilter?.community,
    credit_sale_permission: typeof dataFilter?.credit_sale_permission === "string" ? [dataFilter?.credit_sale_permission] : dataFilter?.credit_sale_permission,
  });
  const { data: userSettingsResponse } = useGetSettings();
  const creditSaleDecimalValue = userSettingsResponse?.find(
    (item) => item.key === "CREDIT_SALE_DECIMAL_PLACES",
  )?.value;
  const creditSaleDecimalPlace = isNaN(Number(creditSaleDecimalValue))
    ? 0
    : Number(creditSaleDecimalValue);
  const { mutateAsync: getAllDepositRequests, isLoading: allDepositLoading } =
    useGetMassDepositRequests();
  const { mutateAsync: approveRequest } = useApproveDepositRequest();
  const { mutateAsync: rejectRequest } = useRejectDepositRequest();
  const paymentApplyModal = useRef<PaymentApplyModalRef>(null);
  const paymentApprovalModal = useRef<PaymentApprovalModalRef>(null);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const checkIntroducerInfoModalRef = useRef<CheckIntroducerInfoModalRef>(null);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

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
    setColumnCurrentState,
  } = useGridColumnChange("depositInfoColumnState");

  const depositRequestsWithIndex = useMemo(() => {
    const withdrawals =
      data?.users?.map((item, index) => ({
        ...item,
        no: limit * (page - 1) + index + 1,
      })) || [];
    return [...withdrawals];
  }, [data?.users, limit, page]);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    setSelectedLang({
      type: "KRW",
      label: text("deposit_information_krw_suffix"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const depositReqWithTxid = depositRequestsWithIndex.filter(
      (item) =>
        item.deposit_transaction_id &&
        item?.credit_sale_permission != null &&
        !item.blockchain_result,
    );
    setTxIdsToRequest(depositReqWithTxid.map((item) => item.uuid));
    if (depositReqWithTxid.length > 0) {
      checkbulkTxidOnBlockchainRequest({
        request_ids: depositReqWithTxid.map((item) => item.uuid),
      })
        .then((checkBulkResp) => {
          setValidTxIdRequests(checkBulkResp?.data || []);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [depositRequestsWithIndex, checkbulkTxidOnBlockchainRequest]);

  const handleLanguageChange = (
    event: React.ChangeEvent<object>,
    newValue: string,
  ) => {
    const label = (event.currentTarget as HTMLElement).innerText;
    setSelectedLang({
      type: newValue,
      label,
    });
    setPage(1);
    setLimit(25);
  };

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const handleExcelDownload = (_data: IDepositRequest[]) => {
    jsonToExcelDownload(
      _data?.map((item, index) => ({
        [text("deposit_information_column_header_no")]: index + 1,
        [text("deposit_information_column_request_id")]: item.uuid,
        [text("deposit_information_column_name")]: item.name,
        [text("users_column_header_user_super_trust_status")]:
          item?.super_trust_status === 1
            ? text("deposit_information_super_trust_enabled")
            : text("deposit_information_super_trust_disabled"),
        [text("deposit_information_column_request_type")]: determineRequestType(
          item,
          text,
        ),
        [text("deposit_information_column_phone_number")]: item.phone_number,
        [text("deposit_information_column_user_id")]: item.user_id,
        [text("deposit_information_column_email")]: item.email,
        [text("deposit_information_column_exchange_standard")]:
          item.exchange_standard,
        [text("deposit_information_column_token_name")]: item.deposit_token,
        [text("deposit_information_column_msq_quantity")]: item.msq_amount,
        [text("deposit_information_column_msq_discount")]:
          (item.msq_discount || 0) + "%",
        [text(
          "deposit_information_column_msq_amount",
        )]: `${formatNumberWithCommas(
          item.desosit_amout_in_msq,
          creditSaleDecimalPlace,
          creditSaleDecimalPlace,
        )} ${item.deposit_token}`,
        [text(
          "deposit_information_column_app_display_token_amount",
        )]: `${determineAppDisplayTokenAmount(item, creditSaleDecimalPlace)}`,
        [text("deposit_information_column_purchase_amount")]:
          item.deposit_amout_in_won,
        [text("deposit_information_column_txid")]: item.deposit_transaction_id,
        [text("deposit_information_column_cash_transfer_capture")]:
          item.cash_transfer_capture,
        [text("deposit_information_column_coin_transfer_capture")]:
          item.coin_transfer_capture,
        [text("deposit_information_column_payment_status")]:
          item.status === 0
            ? text("deposit_information_status_waiting_for_approval")
            : item.status === 1
              ? text("deposit_information_status_approved")
              : item.status === 2
                ? text("deposit_information_status_denial_of_approval")
                : null,
        [text("deposit_information_column_repayment_date")]: formatDateAndTime(
          item.start_date,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
        [text("deposit_information_column_application_date")]:
          formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone),
        [text("deposit_information_column_approval_date")]: formatDateAndTime(
          item.action_date,
          "YYYY-MM-DD HH:mm:ss",
          timezone,
        ),
        [text("deposit_information_column_manager")]: item.action_by,
      })),
      `${arrayToString([
        text("deposit_information_file_name"),
        formatDate(new Date(), false),
        selectedLang.type,
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("deposit_information_file_name"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  const handleCheckIntroducerInfo = (row: IDepositRequest) => {
    setIntroducerDepositDetails({
      uuid: row.uuid,
      email: row.email,
      name: row.name,
      credit_sale_permission: row.credit_sale_permission,
      super_save_count: row.super_save_count,
      created_by: row.created_by,
      community_permission: row.community_permission,
      introducer_info: parseIntroducerInfo(row.introducer_info),
    });
    checkIntroducerInfoModalRef.current?.open();
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
      },
      {
        ...sharedColDef,
        filterable: false,
        field: "no",
        headerName: `${text("deposit_information_column_header_no")}`,
        minWidth: 60,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "uuid",
        headerName: `${text("deposit_information_column_request_id")}`,
        minWidth: 100,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <p className="truncate mr-3">{value}</p>
            <Image
              className="cursor-pointer"
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
        field: "name",
        headerName: `${text("deposit_information_column_name")}`,
        minWidth: 90,
        renderCell: ({ value, row }) => {
          const text = `${value} ${row?.corporate_name ? `(${row.corporate_name})` : ""
            }`;
          return (
            <Tooltip title={text} arrow placement="top">
              <Link
                href={`/super-save/deposit-information?searchKey=${text}`}
                target="_blank"
                className="flex w-full justify-between"
              >
                <span className="truncate w-fit ">{text}</span>
                <Image
                  className="ml-2 mt-0.5 cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </Tooltip>
          );
        },
      },
      {
        ...sharedColDef,
        field: "super_trust_status",
        headerName: `${text("deposit_information_user_super_trust_status")}`,
        minWidth: 100,
        type: "boolean",
        renderCell: ({ value }) => {
          if (value === 1) {
            return (
              <div className="text-blue-500 font-medium">
                {text("deposit_information_super_trust_enabled")}
              </div>
            );
          } else {
            return (
              <div className="text-red-500 font-medium">
                {text("deposit_information_super_trust_disabled")}
              </div>
            );
          }
        },
        filterOperators: [
          {
            label: "Is",
            value: "is",
            getApplyFilterFn: (filterItem) => {
              if (!filterItem.value || filterItem.value.length === 0) {
                return null;
              }
              return ({ value }) => {
                if (filterItem.value === "Enabled") {
                  return value === 1;
                } else if (filterItem.value === "Disabled") {
                  return value === 0;
                }
                return false;
              };
            },
            InputComponent: ({ item, applyValue, focusElementRef }: GridFilterInputValueProps) => {
              const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
                applyValue({ ...item, value: event.target.value });
              };
              return (
                <FormControl fullWidth className="relative">
                  <InputLabel shrink htmlFor="super-trust-status-filter" className="absolute -left-4  w-full top-2">
                    Value
                  </InputLabel>
                  <NativeSelect
                    ref={focusElementRef}
                    value={item.value || ""}
                    onChange={handleChange}
                    inputProps={{
                      name: "super-trust-status",
                      id: "super-trust-status-filter"
                    }}
                    placeholder="Filter value"
                  >

                    <option value={undefined}></option>
                    <option value={1}>{text("deposit_information_super_trust_enabled")}</option>
                    <option value={0}>{text("deposit_information_super_trust_disabled")}</option>
                  </NativeSelect>
                </FormControl>
              );
            }
          } as GridFilterOperator,
        ]
      },
      {
        ...sharedColDef,
        field: "credit_sale_permission",
        headerName: `${text("deposit_information_column_request_type")}`,
        minWidth: 130,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return <div>{determineRequestType(row, text)}</div>;
        },
      },
      {
        ...sharedColDef,
        field: "phone_number",
        headerName: `${text("deposit_information_column_phone_number")}`,
        minWidth: 140,
      },
      {
        ...sharedColDef,
        field: "email",
        headerName: `${text("deposit_information_column_email")}`,
        minWidth: 150,
        filterable: showEmail,
        sortable: showEmail,
        renderCell: ({ value }) => (
          <div className="flex w-full items-center justify-between">
            <span className="w-fit truncate text-ellipsis">
              {!showEmail ? "*****@*****" : value}
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
      // {
      //   ...sharedColDef,
      //   field: "exchange_standard",
      //   headerName: `${text("deposit_information_column_exchange_standard")}`,
      //   minWidth: 150,
      // },
      // {
      //   ...sharedColDef,
      //   field: "deposit_token",
      //   headerName: `${text("deposit_information_column_token_name")}`,
      //   minWidth: 150,
      // },
      {
        ...sharedColDef,
        field: "msq_amount",
        headerName: `${text("deposit_information_column_msq_quantity")}`,
        minWidth: 120,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value, 3)} {selectedLang.label}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "msq_discount",
        type: "number",
        headerName: `${text("deposit_information_column_msq_discount")}`,
        minWidth: 65,
        renderCell: ({ value }) => <div>{value || 0}%</div>,
      },
      {
        ...sharedColDef,
        field: "desosit_amout_in_msq",
        headerName: text("deposit_information_column_msq_amount"),
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        type: "number",
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" justifyContent="center">
            <div>
              {formatNumberWithCommas(
                row.desosit_amout_in_msq,
                creditSaleDecimalPlace,
                creditSaleDecimalPlace,
              )}{" "}
              {row.deposit_token}
            </div>
          </Box>
        ),
      },
      {
        ...sharedColDef,
        field: "app_display_token_amount",
        headerName: text("deposit_information_column_app_display_token_amount"),
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        filterable: false,
        sortable: false,
        type: "number",
        renderCell: ({ row }) => {
          return (
            <Box display="flex" alignItems="center" justifyContent="center">
              <div>
                {determineAppDisplayTokenAmount(row, creditSaleDecimalPlace)}
              </div>
            </Box>
          );
        },
      },
      {
        ...sharedColDef,
        field: "deposit_amout_in_won",
        headerName: `${text("deposit_information_column_purchase_amount")}`,
        minWidth: 140,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)} {selectedLang.label}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "deposit_transaction_id",
        headerName: `${text("deposit_information_column_txid")}`,
        minWidth: 110,
        renderCell: ({ value, row }) =>
          value ? (
            <span className="w-full items-center flex justify-between">
              {value === "requested_help" ? (
                <p className="truncate w-fit ">{value}</p>
              ) : (
                <a
                  target="_blank"
                  href={`https://polygonscan.com/tx/${value}`}
                  className="truncate w-fit "
                  rel="noreferrer"
                >
                  {value}
                </a>
              )}
              <IconButton onClick={() => copyToClipboard(value)}>
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
            </span>
          ) : (
            <div
              data-cy={`txid-${selectedLang.type}`}
              id={htmlIds.btn_platform_details_add_api_key}
              className="flex items-center text-sm h-10 text-blue-500 rounded-md cursor-pointer"
              onClick={() =>
                setTXIDModal({
                  open: true,
                  modalTitle: text("deposit_information_txid_modal_title"),
                  name: "deposit_transaction_id",
                  label: "TXID",
                  id: "txid",
                  requestId: row.uuid,
                })
              }
            >
              <PlusIcon className="w-5 stroke-2 h-4" />
              <span>{text("deposit_information_add_txid")}</span>
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "cash_transfer_capture",
        headerName: `${text(
          "deposit_information_column_cash_transfer_capture",
        )}`,
        minWidth: 85,
        filterable: false,
        renderCell: ({ value }) =>
          <button
            className={`flex items-center text-xs px-2 h-6 rounded-md ${value ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
              }`}
            onClick={() => {
              if (value) {
                setModalFileUrl(value);
                viewFilesModal.current?.open();
              }
            }}
            disabled={!value}
          >
            {text("deposit_information_column_transfer_capture_button_text")}
          </button>
      },
      {
        ...sharedColDef,
        field: "coin_transfer_capture",
        headerName: `${text(
          "deposit_information_column_coin_transfer_capture",
        )}`,
        minWidth: 85,
        filterable: false,
        renderCell: ({ value }) =>
          <button
            className={`flex items-center text-xs px-2 h-6 rounded-md ${value ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
              }`}
            onClick={() => {
              if (value) {
                setModalFileUrl(value);
                viewFilesModal.current?.open();
              }
            }}
            disabled={!value}
          >
            {text("deposit_information_column_transfer_capture_button_text")}
          </button>
      },
      {
        ...sharedColDef,
        field: "coin_transfer_check",
        headerName: `${text("deposit_information_column_coin_transfer_check")}`,
        minWidth: 85,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          const checkTxidResult = validTxIdRequests.find(
            (item) => item.request_id === row.uuid,
          );
          return row.deposit_transaction_id &&
            row?.credit_sale_permission != null ? (
            <CheckTXIDCell
              requestId={row.uuid}
              checkTxidResult={checkTxidResult}
              blockchainResult={row.blockchain_result}
              isLoading={
                checkBulkOnBlockChainLoading &&
                txIdsToRequest.includes(row.uuid)
              }
            />
          ) : (
            "---"
          );
        },
      },
      {
        ...sharedColDef,
        field: "introducer_info",
        headerName: `${text("deposit_information_column_introducer_info")}`,
        minWidth: 120,
        filterable: false,
        renderCell: ({ value, row }) => {
          const parsedIntroducerInfo = parseIntroducerInfo(value);
          return (
            <button
              className={`flex items-center text-xs px-2 h-6 text-white rounded-md ${parsedIntroducerInfo.length > 0 ? "bg-blue-500" : "bg-red-500"
                }`}
              onClick={() => handleCheckIntroducerInfo(row)}
            >
              {text("deposit_information_introducer_info_button_text")}{" "}
              {`(${parsedIntroducerInfo.length})`}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "change_count",
        headerName: `${text("deposit_information_column_change_count")}`,
        minWidth: 120,
        filterable: false,
        renderCell: ({ value = 0 }) =>
          value && Number(value) > 0 ? (
            <Chip
              label={`${value} ${text(
                "deposit_information_column_change_count_badge_times",
              )}`}
              color="warning"
              size="small"
            />
          ) : (
            <Chip
              label={text(
                "deposit_information_column_change_count_badge_not_changed",
              )}
              color="success"
              size="small"
              variant="outlined"
            />
          ),
      },
      {
        ...sharedColDef,
        field: "deposit_transaction_id_usdt",
        headerName: `${text("deposit_information_column_txid_usdt")}`,
        minWidth: 200,
        filterable: false,
        renderCell: ({ value, row }) =>
          value ? (
            <>
              <p className={"truncate"}>{value}</p>{" "}
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
            </>
          ) : (
            <div
              data-cy={"usdt-txid"}
              id={htmlIds.btn_platform_details_add_api_key}
              className="flex items-center text-sm h-10 text-blue-500 rounded-md cursor-pointer"
              onClick={() =>
                setTXIDModal({
                  open: true,
                  modalTitle: text("deposit_information_usdt_txid_modal_title"),
                  name: "deposit_transaction_id_usdt",
                  label: "USDT TXID",
                  id: "usdt_txid",
                  requestId: row.uuid,
                })
              }
            >
              <PlusIcon className="w-5 stroke-2 h-4" />
              <span>{text("deposit_information_add_txid")}</span>
            </div>
          ),
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: `${text("deposit_information_column_payment_status")}`,
        minWidth: 150,
        align: "center",
        headerAlign: "center",
        filterable: false,
        renderCell: ({ value, row }) => {
          if (value == 0) {
            return (
              <div className="flex flex-col items-center gap-1">
                <div className="text-green-600 font-medium underline cursor-pointer">
                  {text("deposit_information_status_waiting_for_approval")}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      paymentApprovalModal.current?.open({
                        name: row.name,
                        user_id: row.user_id,
                        request_id: row.uuid,
                        email: row.email,
                        phone: row.phone_number,
                        id: row.uuid,
                      })
                    }
                    className="group rounded-md border border-transparent bg-blue-500 px-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("deposit_information_status_approve")}
                  </button>
                  <button
                    onClick={() =>
                      paymentApplyModal.current?.open({
                        name: row.name,
                        user_id: row.user_id,
                        request_id: row.uuid,
                        email: row.email,
                      })
                    }
                    className="group rounded-md border border-transparent bg-red-500 px-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("deposit_information_status_reject")}
                  </button>
                </div>
              </div>
            );
          } else if (value == 1) {
            return (
              <div className={"flex space-x-1 items-center"}>
                <div className="text-blue-400 font-medium">
                  {text("deposit_information_status_approved")}
                </div>
                <Tooltip title={text("deposit_information_transfer_tooltip")}>
                  <IconButton
                    onClick={() =>
                      setTransferOwnerShipModalOpen({
                        requestId: row.uuid,
                        open: true,
                      })
                    }
                  >
                    <TransferIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={text("deposit_information_revoke_tooltip")}>
                  <IconButton onClick={() => handleRevoke(row.uuid)}>
                    <CloseIcon fill={["none", "red"]} />
                  </IconButton>
                </Tooltip>
              </div>
            );
          } else if (value === 2) {
            return (
              <div className="text-orange-500 font-medium">
                {text("deposit_information_status_denial_of_approval")}
              </div>
            );
          } else if (value === 3) {
            return (
              <div className="font-medium">
                {text("deposit_information_status_completed")}
              </div>
            );
          } else {
            return null;
          }
        },
      },
      {
        ...sharedColDef,
        field: "start_date",
        type: "date",
        headerName: `${text("deposit_information_column_repayment_date")}`,
        minWidth: 180,
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        type: "date",
        headerName: `${text("deposit_information_column_application_date")}`,
        minWidth: 130,
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "remark",
        headerName: `${text("deposit_information_column_remark")}`,
        minWidth: 150,
        renderCell: ({ value }) => value || "---",
      },
      {
        ...sharedColDef,
        field: "action_date",
        type: "date",
        headerName: `${text("deposit_information_column_approval_date")}`,
        minWidth: 120,
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
        field: "action_by",
        headerName: `${text("deposit_information_column_manager")}`,
        minWidth: 120,
        renderCell: ({ value }) => value || "---",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      text,
      selectedLang.label,
      selectedLang.type,
      showEmail,
      checkBulkOnBlockChainLoading,
      validTxIdRequests,
      txIdsToRequest,
    ],
  );

  const handleSave = () => {
    if (!status || status == "unselected") {
      alertDialog({
        title: text("deposit_information_select_a_destination"),
      });
      return;
    }
    if (status === "approved") {
      confirmDialog({
        title: `${rowSelectionModel.length} ${text(
          "deposit_information_status_selected",
        )}`,
        content: text("deposit_information_status_approval_confirmation"),
        onOk: () =>
          approveRequest({
            request_ids: rowSelectionModel as string[],
          })
            .then(() => {
              setRowSelectionModel([]);
              refetch();
              alertDialog({
                title: text("deposit_information_status_approval_saved_title"),
              });
              setStatus("unselected");
              queryClient.invalidateQueries("deposit-requests");
            })
            .catch((error: any) => {
              toast.error(error?.response?.data?.result);
            }),
      });
    } else if (status === "reject") {
      confirmDialog({
        title: `${rowSelectionModel.length} ${text(
          "deposit_information_status_selected",
        )}`,
        content: text("deposit_information_status_reject_conformation"),
        onOk: () =>
          rejectRequest({
            request_ids: rowSelectionModel as string[],
            remark: "",
          })
            .then(() => {
              setRowSelectionModel([]);
              refetch();
              setStatus("unselected");
              alertDialog({
                title: text("deposit_information_status_approval_saved_title"),
              });
              queryClient.invalidateQueries("deposit-requests");
            })
            .catch((error: any) => {
              toast.error(error?.response?.data?.result);
            }),
      });
    }
  };

  const handleRevoke = (request_id: string) => {
    confirmDialog({
      title: text("deposit_information_revoke_title"),
      warning: (
        <Alert severity="warning">
          {text("deposit_information_revoke_content")}
        </Alert>
      ),
      onOk: () =>
        revokeDepositRequest({
          request_ids: [request_id],
        })
          .then((res) => {
            refetch();
            toast(res?.result || "Success", {
              type: "success",
            });
            queryClient.invalidateQueries("deposit-requests");
          })
          .catch((err) => {
            toast(err?.message || "error", {
              type: "error",
            });
          }),
    });
  };

  // commenting due to unused
  // const handleTransferOwnership = (request_id : string) => {
  //   confirmDialog({
  //     title: text("deposit_information_revoke_title"),
  //     warning: <Alert severity="warning">{text("deposit_information_revoke_content")}</Alert>,
  //     onOk: () =>
  //       revokeDepositRequest({
  //         request_ids: [request_id],
  //       }).then((res) => {
  //         refetch();
  //         toast(res?.result || "Success", {
  //           type: "success",
  //         });
  //         queryClient.invalidateQueries("deposit-requests");
  //       }).catch(err=>{
  //         toast(err?.message || "error", {
  //           type: "error",
  //         });
  //       }),
  //   });
  // };

  const handleDataFilterChange = useCallback(
    (_dataFilter: DataFilterType) => {
      setPage(1);
      setDataFilter(_dataFilter);
      if (router.isReady) {
        const newCommunity = _dataFilter.community;
        const newCreditSalePermission = _dataFilter.credit_sale_permission;
        router.push({
          pathname: router.pathname,
          query: {
            ...Object.fromEntries(
              Object.entries({
                ...router.query,
                ..._dataFilter,
                community: newCommunity === "all" ? undefined : newCommunity,
                credit_sale_permission: typeof newCreditSalePermission === "string" ? [newCreditSalePermission] : newCreditSalePermission,
              }).filter(([_, v]) => v !== undefined && v !== null && v.length !== 0),
            ),
          },
        });
        setFirstLoaded(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.searchKey,
      router.query.startDate,
      router.query.endDate,
      router.query.status,
      router.query.community,
      router.query.sort_column_name,
      router.query.sort_type,
      router.query.credit_sale_permission,
    ],
  );

  useEffect(() => {
    if (router.isReady && !isBigScreen) {
      const searchKey = router.query.searchKey as string;
      const startDate = router.query.startDate as string;
      const endDate = router.query.endDate as string;
      const status = router.query.status as string;
      const columnName = router.query.sort_column_name as string;
      const sortType = router.query.sort_type as "asc" | "desc";
      const community = router.query.community as string;
      const creditSalePermission = router.query.credit_sale_permission as string[];

      setDataFilter({
        searchKey,
        startDate,
        endDate,
        status: status !== undefined ? Number(status) : undefined,
        sort_column_name: columnName,
        sort_type: sortType,
        community: community,
        credit_sale_permission: typeof creditSalePermission === "string" ? [creditSalePermission] : creditSalePermission,
      });
    }
  }, [
    router.isReady,
    router.query.searchKey,
    router.query.startDate,
    router.query.endDate,
    router.query.status,
    router.query.sort_column_name,
    router.query.sort_type,
    router.query.community,
    router.query.credit_sale_permission,
    isBigScreen,
  ]);

  const filteredColumns = useMemo(() => {
    return columns.filter(
      (col) =>
        selectedLang.type === "USDT" ||
        col.field !== "deposit_transaction_id_usdt",
    );
  }, [columns, selectedLang.type]);


  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);
  /* DataGrid Columns Reorder & Sort Handling End */

  const handleRefetchList = (updatedIntroInfo: IntroducerInfoObj[]) => {
    refetch();
    setIntroducerDepositDetails((prevData) => ({
      ...prevData,
      introducer_info: updatedIntroInfo,
    }));
  };
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  // function to handle the filter change from the MUI Data Grid filter
  const handleMuiDataFilter = debounce((data: GridFilterModel, models) => {

    if (models.reason === "restoreState") {
      models?.api?.hidePreferences();
    }
    // this ensure the function only proceeds when there is a change to the filters
    if (data.items === filterArr && data.linkOperator === linkOperator) return;
    // set the new filter state
    if (!data.items.length) {
      setMuiFilters(undefined);
    } else {
      setMuiFilters(data);
    }
    setColumnCurrentState({ ...models?.api?.exportState(), filter: { filterModel: data } });
    if (data?.linkOperator) {
      setLinkOperator(data?.linkOperator);
    }
    const newFilters = data.items.filter((item) => !!item.value && !!item.columnField);

    if (newFilters === filterArr) return;
    setFilterArr(newFilters);
    if (models.reason === "upsertFilterItem" || models.reason === "deleteFilterItem") {
      setShowSaveBtn(true);
      handleDataFilterChange({
        ...router.query,
        action_date: undefined
      });
    }


  }, 500);



  useEffect(() => {
    if (filterArr.length) return;
    // filters from the router
    const routerFilters: string[] = typeof router.query.action_date === "string" ? [router.query.action_date] as string[] : router.query.action_date as string[];

    if (router.isReady) {
      handleDataFilterChange({
        ...router.query,
        action_date: routerFilters
      });
    }

    // if the filter is empty and the router has a filter, generate the filters and set it to the state
    if (routerFilters?.length) {
      const filters = routerFilters?.map((item, ind) => {
        const getOp = ind === 0 ? "onOrAfter" : "onOrBefore";
        return {
          id: `action_date_${ind}`,
          columnField: "action_date",
          value: item,
          operatorValue: getOp,
        };
      });
      // Now set the generated filters to the state
      setFilterArr(() => filters);
      const filterModel = {
        items: filters,
        linkOperator: "and",
        quickFilterValues: filterArr,
        quickFilterLogicOperator: "and"
      } as GridFilterModel;
      setMuiFilters(filterModel);
      setColumnCurrentState({
        ...apiRef?.current?.exportState(), filter: {
          filterModel
        }
      });
    }

  }, [filterArr, router.isReady]);


  const handleSortModelChange = (newSortModel: GridSortModel, refetch = false) => {
    // check if the sort model is available in the state on initial function call
    const isSortModelAvailable = apiRef.current?.state?.sorting?.sortModel[0]?.field !== undefined && apiRef.current?.state?.sorting?.sortModel[0]?.sort !== undefined;
    // check if there is a sort model
    if (newSortModel.length) {
      if (viewSort === "on" && !refetch) {
        setSortModel(newSortModel);
        setSortMode("client");
        handleColumnChange(true);
        removeSortQueries();
        setFirstSort(() => false);
      } else {
        // check if the sort model is client side and the column is the no column
        if (newSortModel[0]?.field === "no") {
          setSortMode("client");
          // clear the sort queries because this is a client side sort
          handleColumnChange(true);
          setSortModel(newSortModel);
          removeSortQueries();

        } else {
          setSortMode("server");
          // if there is a sort model, call the handleDataFilterChange function with the new sort model
          handleColumnChange(false);
          setSortModel(newSortModel);
          handleDataFilterChange({
            ...dataFilter,
            sort_column_name: newSortModel[0]?.field,
            sort_type: newSortModel[0]?.sort as "asc" | "desc",
          });
        }
      }
      setFirstSort(() => false);
    } else {
      // if there is no sort model reset the sort model to empty
      if (!firstSort) {
        setSortModel(newSortModel);
        removeSortQueries();
      } else if (isSortModelAvailable) {
        // meaning the user wants to clear the sortModel
        setSortModel(newSortModel);
        removeSortQueries();
      }
    }

  };

  useEffect(() => {
    setFirstSort(true);
    setFirstOrder(true);
  }, []);

  const removeSortQueries = () => {
    if (router.isReady) {
      router.push({
        pathname: router.pathname,
        query: {
          ...Object.fromEntries(
            Object.entries({
              ...router.query,
              sort_column_name: undefined,
              sort_type: undefined,
            }).filter(([_, v]) => typeof v === "string" && v !== undefined && v !== null),
          ),
        },
      },
        undefined,
        { shallow: false }
      );
    }
  };


  useEffect(() => {
    if (apiRef.current) {
      // Get all columns without considering any user modifications
      const columns = apiRef.current.getAllColumns();
      // Process the columns to get the raw state
      const rawColumnState = columns.map(column => ({
        field: column.field,
        headerName: column.headerName,
        width: column.width,
      }));
      setInitialState(rawColumnState);
    }
  }, []);

  useEffect(() => {
    const isColumnStateChanged = Object.entries(columnCurrentState).length > 0;
    const isFirstRestore = JSON.stringify(getLocalStorageState("depositInfoColumnState")) === JSON.stringify(columnCurrentState);
    const prevColumnState = isColumnStateChanged ? columnCurrentState : getLocalStorageState("depositInfoColumnState");
    if (prevColumnState) {
      setColumnCurrentState({ ...prevColumnState, sorting: { sortModel: sortModel } });
      apiRef.current.restoreState({ ...prevColumnState, sorting: { sortModel: sortModel } });
      // apiRef.current.restoreState({ ...prevColumnState, sorting: { sortModel: sortModel }, preferencePanel: { open: false } });
      if (isFirstRestore && modelReason !== "upsertFilterItems") {
        apiRef?.current?.hidePreferences();
      }

    } else {
      apiRef?.current?.restoreState(initialState);
      setFirstSort(true);
      setFirstOrder(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredColumns, sortModel, firstSort, sortMode]);

  const handleSortView = (val: string) => {
    setViewSort(val);
    if (val === "off") {
      setSortModel(sortModel);
      handleSortModelChange(sortModel, true);
    }
  };

  return (
    <div ref={divRef} className="h-full px-5 py-5">
      <div className="w-full platforms-header">
        <h4 className="text-2xl font-medium">
          {text("deposit_information_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("deposit_information_detail")}
        </span>
        <div className={"mb-2 mt-5"}>
          <LanguageSelectedTab
            selectedLang={selectedLang}
            handleLanguageChange={handleLanguageChange}
          />
        </div>

        {user_id === undefined && (
          <div
            className={clsx(
              "flex space-x-5 mb-5 overflow-x-auto py-4",
            )}
          >
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_krw")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas(data?.totalParticipationAmountInKrw)}{" "}
                        {text("deposit_information_krw_suffix")}
                      </>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_paid_krw")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas(data?.totalPaidAmountInKrw)}{" "}
                        {text("deposit_information_krw_suffix")}
                      </>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_remaining_krw")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas((data?.totalParticipationAmountInKrw ?? 0) - (data?.totalPaidAmountInKrw ?? 0))}{" "}
                        {text("deposit_information_krw_suffix")}
                      </>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-[14rem] rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_usdt")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                      {formatNumberWithCommas(
                        data?.totalParticipationAmountInUsdt,
                      )}{" "}
                      {text("global_currency_name")}
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_paid_usdt")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas(data?.totalPaidAmountInUsdt)}{" "}
                        {text("global_currency_name")}
                      </>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-56 rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_remaining_usdt")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas((data?.totalParticipationAmountInUsdt ?? 0) - (data?.totalPaidAmountInUsdt ?? 0))}{" "}
                        {text("global_currency_name")}
                      </>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-[15rem] rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_krw_and_usdt")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {
                    isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {formatNumberWithCommas(data?.totalParticipationAmount)}{" "}
                        {text("deposit_information_krw_suffix")}
                      </>
                    )}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-3 h-24 min-w-[15rem] rounded-lg border border-slate-300 px-4 py-3 shadow-md">
                <span className="text-gray-400 font-medium text-sm popinText">
                  {text("deposit_information_total_participants")}
                </span>
                <span className="flex items-center font-medium text-sm mt-1">
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    formatNumberWithCommas(data?.totalNumberOfParticipation)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`${!isBigScreen && "border-b"} py-2 overflow-auto`}>
        {!isBigScreen && (
          <div className={"flex flex-wrap-reverse justify-end gap-3 items-center"}>
            {depositRequestsWithIndex.length > 0 && (
              <>
                <ShowToolbar
                  showToolbar={showToolbar}
                  setShowToolbar={setShowToolbar}
                />
                <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
              </>
            )}
            <FilterButton
              onClick={() => {
                setFilterMobileDrawerOpen(true);
              }}
            />
          </div>
        )}
        <div className="overflow-x-auto custom_scroll_bar pt-2">
          <DataFilterWrapper
            data={[
              {
                statusOptions: [
                  {
                    label: "deposit_information_status_denial_of_approval",
                    value: 2,
                    className: "text-yellow-600",
                  },

                  {
                    label: "deposit_information_status_waiting_for_approval",
                    value: 0,
                    className: "text-green-600",
                  },
                  {
                    label: "deposit_information_status_approved",
                    value: 1,
                    className: "text-blue-600",
                  },
                ],
                onChange: handleDataFilterChange,
              },
            ]}

            filterMobileDrawerOpen={filterMobileDrawerOpen}
            setFilterMobileDrawerOpen={setFilterMobileDrawerOpen}
            isDepositScreen={true}
            onCommunityChange={(value) =>
              handleDataFilterChange({ ...router.query, community: value })
            }
            onCreditSalePermission={(value) =>
              handleDataFilterChange({ ...router.query, credit_sale_permission: value })
            }
          />
        </div>
      </div>

      <div className={`${isTablet ? (isMobile ? "" : "max-[980px]:flex-wrap max-[980px]:justify-end") : "justify-between"} flex flex-col min-[690px]:flex-row `}>
        <div className="flex m-2 justify-end items-center">
          {Object.keys(columnCurrentState).length > 0 && (!firstSort || !firstOrder || showSaveBtn) && (
            <SaveNResetButtons
              saveHandler={() => {
                setOpenConfirmDialog(true);
              }}
              resetHandler={() => {
                handleResetDefault(false);
                setColumnCurrentState({});
                setFirstOrder(true);
                setFirstSort(true);
                removeSortQueries();
                setSortModel([]);
                setMuiFilters({ items: [] });
                setFilterArr([]);
                setShowSaveBtn(false);
              }}
              onYesHandler={() => {
                setFirstOrder(true);
                setFirstSort(true);
              }}
            />
          )
          }
        </div>
        <div
          className={clsx(
            "flex justify-end gap-1 py-3",
            isMobile
              ? "flex-wrap w-full gap-2"
              : "items-center",
          )}
        >
          {isBigScreen && (
            <div className="flex flex-row">
              {depositRequestsWithIndex.length > 0 && (
                <>
                  <ShowToolbar
                    showToolbar={showToolbar}
                    setShowToolbar={setShowToolbar}
                  />
                  <ShowEmail
                    showEmail={showEmail}
                    setShowEmail={setShowEmail}
                  />
                </>
              )
              }
            </div>
          )}
          <div className={"flex justify-between xl:space-x-2 items-center"}>
            {isBigScreen && (
              <div className="w-[120px]">
                <p
                  id={htmlIds.p_deposit_information_selected_rows}
                  className="text-neutral-500"
                >{`${rowSelectionModel.length} ${text(
                  "deposit_information_status_selected",
                )}`}</p>
              </div>
            )}
            <Select
              className="bg-gray-50 h-11 w-[75%] text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600"
              inputProps={{ "aria-label": "Without label" }}
              MenuProps={MenuProps}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!rowSelectionModel.length}
            >
              <MenuItem disabled value="unselected">
                <em>{text("deposit_information_change_approval_status")}</em>
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
              id={htmlIds.btn_deposit_information_save}
              onClick={handleSave}
              disabled={!rowSelectionModel.length || status === "unselected"}
              className="flex items-center w-[20%] justify-center disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
            >
              <span>{text("deposit_information_save_title")}</span>
            </button>
          </div>
          <button
            disabled={allDepositLoading || (data?.users || [])?.length <= 0}
            id={htmlIds.btn_deposit_information_excel_download}
            onClick={() => {
              getAllDepositRequests(
                {
                  searchKey: dataFilter?.searchKey,
                  from_date: dataFilter?.startDate,
                  to_date: dataFilter?.endDate,
                  status: dataFilter?.status,
                  community: dataFilter?.community,
                  credit_sale_permission: dataFilter?.credit_sale_permission,
                  ...(user_id ? { user_id: user_id } : {}),
                  sort_type: dataFilter?.sort_type,
                  sort_column_name: dataFilter?.sort_column_name,
                  filter_condition: (filterArr.length && filterArr?.length > 1) ? linkOperator : undefined,
                  search_by: filterArr?.map((item) => {
                    return {
                      search_key: item.columnField,
                      search_value: item.value,
                      op: item.operatorValue,
                    };
                  }).filter((item) => !!item.search_value),
                },
                {
                  onSuccess: (res) => {
                    res.users.length && handleExcelDownload(res.users);
                  },
                },
              );
            }}
            className={clsx(
              "flex items-center justify-center w-auto xl:ml-3 px-3 text-sm h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed",
            )}
          >
            {allDepositLoading && <Spinner />}{" "}
            <span>{text("deposit_information_excel_download_title")}</span>
          </button>
        </div>
      </div>
      <div
        className="w-full bg-white tableContainer"
        id={htmlIds.div_users_table_container}
      >
        <DataGridPro
          rowCount={data?.users?.length || 0}
          getRowId={(row) => row?.uuid}
          rows={depositRequestsWithIndex}
          columns={filteredColumns}
          loading={isLoading || isFetching}
          paginationMode="server"
          autoHeight={!isLoading}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          checkboxSelection
          isRowSelectable={(row) => row.row?.status === 0}
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          apiRef={apiRef}
          onColumnOrderChange={() => {
            handleColumnChange(false);
            setFirstOrder(false);
          }}
          filterMode="server"
          sortingMode={sortMode}
          filterModel={muiFilters}
          onFilterModelChange={(values, models) => {
            handleMuiDataFilter(values, models);
          }}
          sortModel={sortModel}
          onSortModelChange={(newSortModel, models) => {
            setColumnCurrentState({ ...models?.api?.exportState(), sorting: { sortModel: newSortModel } });
            handleSortModelChange(newSortModel);
          }
          }
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
          serverSideSorting={true}
          viewSort={viewSort}
          setViewSort={handleSortView}
        />
      </div>
      <PaymentApplyModal onSubmit={refetch} ref={paymentApplyModal} />
      <PaymentApprovalModal
        onSubmit={refetch}
        ref={paymentApprovalModal}
        refetch={refetch}
        status={status}
        setStatus={setStatus}
      />
      <TXIDModal
        open={tXIDModal.open}
        onClose={() => {
          setTXIDModal({
            open: false,
            modalTitle: "",
            id: "",
            label: "",
            name: "deposit_transaction_id",
            requestId: "",
          });
        }}
        tXIDModal={tXIDModal}
        refetchDeposit={refetch}
      />
      <TransferOwnerShipModal
        requestId={transferOwnerShipModalOpen.requestId}
        open={transferOwnerShipModalOpen.open}
        handleClose={() => {
          setTransferOwnerShipModalOpen({
            open: false,
            requestId: "",
          });
        }}
        handleSubmit={refetch}
      />
      <ViewFilesModal
        ref={viewFilesModal}
        files={[{ file_name: "transfer_capture", file_url: modalFileUrl }]}
      />
      <CheckIntroducerInfoModal
        ref={checkIntroducerInfoModalRef}
        depositDetails={introducerDepositDetails}
        refetchList={handleRefetchList}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
}

export default PaymentInformationScreen;
