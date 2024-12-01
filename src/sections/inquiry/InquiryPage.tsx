import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AllLocalKeys, useLocale } from "locale";
import {
  DataFilterType,
  DateFormatter,
  ShowEmail,
  Spinner,
} from "@common/components";
import { htmlIds } from "@cypress/utils/ids";
import { GridColDef, GridEventListener, GridSelectionModel } from "@mui/x-data-grid";
import { useDialog } from "@common/context";
import {
  useGetInquiries,
  useDeleteInquiry,
  useUpdateInquiryStatus,
  useSendResponse,
  useGetMassInquiries,
  usePostAdminHistoryLog,
} from "api/hooks";
import { IInquiry } from "api/hooks/inquiry/type";
import {
  resetMUIToolbarFilter,
  arrayToString,
} from "@common/utils/helpers";
import { customisedTableClasses } from "@common/constants/classes";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  Box,
  FormControl,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { LocalKeys } from "locale";
import DataModal from "./components/DataModal";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { formatDate, formatDateAndTime } from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import SelectField from "@common/components/FormInputs/SelectField";
import { jsonToExcelDownload } from "@common/utils/excelutil";

const sharedColDef: GridColDef = {
  field: "",
  sortable: false,
  flex: 1,
};

const CHANGE_STATUSES = [
  { label: "inquiry_status_waiting", value: "waiting" },
  { label: "inquiry_status_completed", value: "completed" },
  { label: "inquiry_status_hold", value: "hold" },
  { label: "inquiry_status_in_progress", value: "inprogress" },
];

const typeOptions = [
  { label: "inquiry_status_p2u", value: "P2U" },
  { label: "inquiry_status_supersave", value: "SUPER SAVE" },
  { label: "inquiry_status_general", value: "General" },
  { label: "inquiry_status_bug", value: "Bug" },
  { label: "inquiry_status_p2p", value: "P2P Trade" },
];

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

type IResponse = {
  id: null | string;
  response: string;
  push_notification: boolean;
  send_email: boolean;
};

type Status = "waiting" | "hold" | "inprogress";
const statusSuffixMap = {
  waiting: "inquiry_waiting_status_suffix",
  hold: "inquiry_hold_status_suffix",
  inprogress: "inquiry_inprogress_status_suffix",
};

export default function InquiryPage() {
  const { text } = useLocale();
  const { timezone } = useTimezone();
  const { alertDialog, confirmDialog } = useDialog();
  const apiRef = useGridApiRef();

  const [lastId, setLastId] = useState<string>();
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const [status, setStatus] = useState<string>("unselected");
  const [content, setContent] = useState<string>("");
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseError, setResponseError] = useState<string | null>("");
  const [response, setResponse] = useState<IResponse>({
    id: null,
    response: "",
    push_notification: true,
    send_email: false,
  });
  const [openResponseModal, setOpenResponseModal] = useState<boolean>(false);
  const [reply, setReply] = useState<string>("");
  const [inquiryStatus, setInquiryStatus] = useState<string>("");
  const [initialTab, setInitialTab] = useState<number>(2);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [inquiryTitle, setInquiryTitle] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setDataFilter(e);
    setFilterStatus("all");
    setFilterType("all");
  }, []);

  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
  const { mutateAsync: deleteInquiryApi } = useDeleteInquiry();
  const { mutateAsync: updateInquiryStatus } = useUpdateInquiryStatus();
  const { mutateAsync: sendInquiryResponse } = useSendResponse();
  const { data, isFetching, refetch } = useGetInquiries(
    {
      limit: 25,
      lastId,
      searchKey:
        (dataFilter?.searchKey?.length || 0) > 0
          ? dataFilter?.searchKey == "all"
            ? undefined
            : dataFilter?.searchKey
          : undefined,
      startDate: dataFilter?.startDate,
      endDate: dataFilter?.endDate,
    },
    {
      onSuccess: (data) => {
        setInquiries((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.rows,
        ]);
      },
    },
  );

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
    if (inquiries?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [inquiries?.length, data?.hasNext, data?.lastId]);

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const getStatusTextAndColor = useCallback(
    (value: string) => {
      let statusText = "";
      let color: string | undefined;
      switch (value) {
        case "waiting":
          statusText = text("super_save_helper_services_waiting");
          color = "text-blue-400";
          break;
        case "completed":
          statusText = text("super_save_helper_services_completed");
          color = "text-green-400";
          break;
        case "inprogress":
          statusText = text("super_save_helper_services_in_progress");
          color = "text-red-400";
          break;
        case "hold":
        case "Hold":
          statusText = text("super_save_helper_services_hold");
          break;
        default:
          break;
      }
      return { statusText, color };
    },
    [text],
  );

  // const viewFilesModal = useRef<ViewFilesModalRef>(null);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("inquiry_page_column_no"),
        minWidth: 80,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "user_name",
        headerName: text("inquiry_page_column_username"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "user_email",
        headerName: `${text("inquiry_page_column_email")}`,
        minWidth: 150,
        filterable: !!showEmail,
        sortable: !!showEmail,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center justify-between">
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
        field: "user_phone",
        headerName: text("inquiry_page_column_phone"),
        minWidth: 150,
        renderCell: ({ value }) => (
          <p className="truncate">{value ? value : "---"}</p>
        ),
      },
      {
        ...sharedColDef,
        field: "title",
        headerName: text("inquiry_page_column_title"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "content",
        headerName: text("inquiry_page_column_content"),
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
            <p
              onClick={() => {
                setResponse((prevResponse) => ({
                  ...prevResponse,
                  id: row.id,
                }));
                updateModalData(row, 2);
              }}
              className="underline cursor-pointer"
            >
              {text("inquiry_page_view_content")}
            </p>
          );
        },
      },
      {
        ...sharedColDef,
        field: "image_url",
        headerName: text("inquiry_page_column_image"),
        minWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          return (
            <button
              className={`flex items-center text-xs px-2 rounded-md h-6 ${row.image_url ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
                }`}
              onClick={() => {
                if (row.image_url) {
                  setResponse((prevResponse) => ({
                    ...prevResponse,
                    id: row.id,
                  }));
                  updateModalData(row, 1);
                }
              }}
              id={`${htmlIds.btn_inquiry_report_view_report}${row.no}`}
              disabled={!row.image_url}
            >
              {text("news_page_column_view")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "type",
        headerName: text("inquiry_page_column_type"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "status",
        headerName: text("inquiry_page_column_status"),
        minWidth: 100,
        renderCell: ({ value }) => {
          const { statusText, color } = getStatusTextAndColor(value);
          return <p className={color}>{statusText}</p>;
        },
      },
      {
        ...sharedColDef,
        field: "app_version",
        headerName: text("table_column_app_version"),
        minWidth: 150,
        renderCell: ({ value }) => (
          <p className="truncate">{value ? value : "---"}</p>
        ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("inquiry_page_column_created_at"),
        minWidth: 150,
        type: "date",
        renderCell: ({ row }) =>
          row.createdAt && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={row.createdAt} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "actions",
        headerName: text("inquiry_page_column_actions"),
        minWidth: 150,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md  mr-2"
              onClick={() => handleDelete(row.id)}
              id={`${htmlIds.btn_inquiry_view_action_edit}${row.no}`}
            >
              {text("news_page_column_action_btn_delete")}
            </button>
            <button
              className={`flex items-center text-xs px-2 h-6 rounded-md mr-2 ${row.status !== "completed" ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
                }`}
              onClick={() => {
                if (row.status !== "completed") {
                  setResponse((prevResponse) => ({
                    ...prevResponse,
                    id: row.id,
                  }));
                  updateModalData(row, 2);
                }
              }}
              disabled={row.status === "completed"}
              id={`${htmlIds.btn_inquiry_view_action_edit}${row.no}`}
            >
              {text("inquiry_page_column_action_btn_send_response")}
            </button>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "response_date",
        headerName: text("education_management_completed_date"),
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) =>
          value ? (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={value} />
            </span>

          ) :
            "---",
      },
      {
        ...sharedColDef,
        field: "response_user",
        headerName: text("deposit_information_column_manager"),
        minWidth: 100,
        renderCell: ({ value }) => (
          <p className="truncate">{value ? value : "---"}</p>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail],
  );

  const inquiriesCount = rowSelectionModel.length;
  const isSingleInquiry = inquiriesCount <= 1;
  const inquiryText = isSingleInquiry ? "inquiry" : "inquiries";
  const inquirySelectionText = isSingleInquiry ? "single_inquiry_selected" : "multiple_inquiries_selected";

  const handleSave = () => {
    if (!status) {
      alertDialog({
        title: text("super_save_helper_services_status_validate"),
      });
      return;
    }

    if (status === "completed") {
      if (rowSelectionModel.length === 1) {
        const id_list = rowSelectionModel as string[];
        const selectedInquiry = inquiries.filter(
          (el) => el.id === id_list[0],
        )[0];
        if (!selectedInquiry) return;

        if (selectedInquiry.status === "completed") {
          alertDialog({
            title: text("inquiry_page_status_validate_already_completed"),
          });
          return;
        }
        setResponse((prevResponse) => ({
          ...prevResponse,
          id: selectedInquiry.id,
        }));
        updateModalData(selectedInquiry, 2);
      } else {
        alertDialog({
          title: text("inquiry_page_completed_status_error"),
        });
      }
    } else {
      if (rowSelectionModel.length > 0) {
        const filteredIds = inquiries.reduce((acc: string[], item) => {
          if (rowSelectionModel.includes(item.id) && item.status !== status) {
            acc.push(item.id);
          }
          return acc;
        }, []);
        setRowSelectionModel(filteredIds);
        const returnStatusSuffix = text(statusSuffixMap[status as Status] as AllLocalKeys);
        confirmDialog({
          title: `${text("inquiry_update")} ${isSingleInquiry ? "" : filteredIds.length} ${text(inquiryText)}${returnStatusSuffix}?`,
          content: `${text("inquiry_update_warning_msg")} ${text(inquirySelectionText)}${returnStatusSuffix.toLowerCase()}?`,
          onOk: async () => {
            const promises = filteredIds.map(id =>
              updateInquiryStatus({ id: id, new_status: status })
            );
            await Promise.all(promises);
            updateUIAfterResponse("super_save_helper_services_status_update");
            setStatus("unselected");
          },
        });
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateModalData = (row: any, initTab: number) => {
    setOpenResponseModal(true);
    setContent(row.content);
    setReply(row.response_content);
    setInquiryStatus(row.status);
    setUserInfo({
      name: row.user_name,
      email: row.user_email,
      phone: row.user_phone,
    });
    setInquiryTitle(row.title);
    setInitialTab(initTab);
    setModalFileUrl(row.image_url);
  };


  const handleDelete = (id?: string) => {
    const isSingleDelete = id !== undefined;
  

    const title = `${text("modal_form_delete_sub_title")} ${
      inquiriesCount > 1
        ? `${rowSelectionModel.length} ${text(
            "deposit_information_status_selected",
          )}`
        : `${text(inquiryText)}?`
    }`;
  
  const content = `${text("popup_form_warning_msg")} ${
    rowSelectionModel.length > 1
      ? text("inquiry_page_modal_delete_confirmation_multiple")
      : text("inquiry_page_modal_delete_confirmation_single")
  } ${text("withdrawal_information_form_info_msg")}?`;

    confirmDialog({
      title: title,
      content: content,
      onOk: async () => {
        try {
          const id_list = isSingleDelete ? [id] : (rowSelectionModel as string[]);
          await deleteInquiryApi({ id: id_list });

          toast.success(`${text(inquiryText)} ${text("delete_inquiry_success")}`);
          updateUIAfterResponse();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(error?.response?.data?.result || `${text(inquiryText)} ${text("delete_inquiry_failure")}`);
        }
      },
    });
  };

  const updateUIAfterResponse = (key?: AllLocalKeys) => {
    if (key) {
      alertDialog({
        title: text(key)
      });
    }
    setRowSelectionModel([]);
    if (lastId !== undefined) {
      setLastId(undefined);
    } else {
      refetch();
    }
    resetMUIToolbarFilter(apiRef);
    document
      ?.querySelector?.(".MuiDataGrid-virtualScroller")
      ?.scrollTo?.({ top: 0 });
  };

  const inquiriesWithIndex = useMemo(
    () => inquiries.map((item, index) => ({ ...item, no: index + 1 })),
    [inquiries],
  );

  const handleSendResponse = (data: {
    response: string;
    push_notification: boolean;
    send_email: boolean;
  }) => {
    setResponseError(null);
    setIsSubmitting(true);
    sendInquiryResponse({ id: response.id, ...data })
      .then(() => {
        updateUIAfterResponse("inquiry_page_status_sent_response");
        setIsSubmitting(false);
        setOpenResponseModal(false);
        setStatus("unselected");
        setResponse({
          id: null,
          response: "",
          push_notification: true,
          send_email: false,
        });
      })
      .catch((error) => {
        console.error("Error sending inquiry response:", error);
        setResponseError(text("inquiry_page_status_response_fail_error"));
        setIsSubmitting(false);
      });
  };

  const handleCancelSendResponse = () => {
    setResponseError(null);
    setOpenResponseModal(false);
    setContent("");
    setReply("");
    setInquiryStatus("");
    setInquiryTitle("");
    setModalFileUrl("");
    setUserInfo({ name: "", email: "", phone: "" });
    setResponse({
      id: null,
      response: "",
      push_notification: true,
      send_email: false,
    });
  };

  const { mutateAsync: getMassInquiry, isLoading: massDownloadLoading } =
    useGetMassInquiries();

  const handleExcelDownload = (rows: IInquiry[]) => {
    jsonToExcelDownload(
      rows?.map((row, index) => ({
        [text("inquiry_page_column_no")]: index + 1,
        [text("inquiry_page_column_username")]: row.user_name,
        [text("inquiry_page_column_email")]: row.user_email,
        [text("inquiry_page_column_phone")]: row.user_phone,
        [text("inquiry_page_column_title")]: row.title,
        [text("inquiry_page_column_content")]: row.content,
        [text("inquiry_page_column_reply")]: row.response_content,
        [text("inquiry_page_column_reply_date")]: row.response_date
          ? formatDateAndTime(
            row.response_date,
            "YYYY-MM-DD HH:mm:ss",
            timezone,
          )
          : "---",
        [text("inquiry_page_column_manager")]: row.response_user
          ? row.response_user
          : "---",
        [text("inquiry_page_column_image")]: row.image_url
          ? row.image_url
          : "---",
        [text("inquiry_page_column_type")]: row.type,
        [text("inquiry_page_column_status")]: getStatusTextAndColor(row.status)
          .statusText,
        [text("table_column_app_version")]: row.app_version,
        [text("inquiry_page_column_created_at")]: row.createdAt
          ? formatDateAndTime(row.createdAt, "YYYY-MM-DD HH:mm:ss", timezone)
          : "---",
      })),
      `${arrayToString([
        text("users_inquiry_file_name"),
        formatDate(new Date(), false),
      ])}`,
    );

    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text("users_inquiry_file_name"),
        formatDate(new Date()) + ".xlsx",
      ]),
    });
  };

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-2 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("inquiry_page_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("inquiry_page_subtitle")}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row overflow-auto custom_scroll_bar border-b  gap-1 ">
        <div className="pt-2">
          <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
        </div>
        <FormControl className="truncate w-full pt-2 md:w-60 min-w-60">
          <SelectField
            className="truncate bg-gray-50  h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
            inputProps={{ "aria-label": "Without label" }}
            label={text("inquiry_status")}
            MenuProps={MenuProps}
            value={filterStatus as string}
            defaultValue={filterStatus as string}
            onChange={(e) => {
              setDataFilter({
                ...dataFilter,
                searchKey: e.target.value as string,
              });
              setFilterStatus(e.target.value as string);
              setFilterType("all");
              setLastId(undefined);
              setInquiries([]);
            }}
          >
            <MenuItem value="all">
              <em>{text("data_filter_all_option")}</em>
            </MenuItem>
            {CHANGE_STATUSES.map((item) => {
              const statusOption = getStatusTextAndColor(item.value);
              return (
                <MenuItem
                  className="text-xs"
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    id={item.label.split("_status_")[1]}
                    className={`text-xs truncate ${statusOption.color}`}
                    primary={statusOption.statusText}
                  />
                </MenuItem>
              );
            })}
          </SelectField>
        </FormControl>

        <FormControl className="truncate w-full md:w-60 pt-2  min-w-60">
          <SelectField
            className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={MenuProps}
            value={filterType as string}
            defaultValue={filterType as string}
            label={text("inquiry_type")}
            onChange={(e) => {
              setDataFilter({
                ...dataFilter,
                searchKey: e.target.value as string,
              });
              setFilterType(e.target.value as string);
              setFilterStatus("all");
              setLastId(undefined);
              setInquiries([]);
            }}
          >
            <MenuItem value="all">
              <em>{text("data_filter_all_option")}</em>
            </MenuItem>
            {typeOptions.map((item) => {
              return (
                <MenuItem
                  className="text-xs"
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    id={item.label.split("_status_")[1]}
                    className="text-xs truncate"
                    primary={text(item.label as LocalKeys)}
                  />
                </MenuItem>
              );
            })}
          </SelectField>
        </FormControl>
      </div>

      <div className="flex flex-wrap gap-1 justify-end items-center py-3">
        <ShowToolbar
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
        <div className="flex items-center gap-2">
          <p className="text-neutral-500">{`${rowSelectionModel.length} selected`}</p>
          <Select
            id={htmlIds.select_bug_report_select_status}
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
              const statusOption = getStatusTextAndColor(item.value);
              return (
                <MenuItem
                  className={"text-xs text-neutral-500"}
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    className={`text-xs ${statusOption.color}`}
                    primary={statusOption.statusText}
                  />
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <div className="flex items-center ml-2 gap-2 pt-2 md:pt-0">
          <button
            id={htmlIds.btn_inquiry_delete_request}
            disabled={!rowSelectionModel.length}
            onClick={() => handleDelete()}
            className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-500 text-white rounded-md"
          >
            <span>{text("super_save_bug_report_modal_delete")}</span>
          </button>
          <div>
            <button
              id={htmlIds.btn_inquiry_add_request}
              className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
              disabled={!rowSelectionModel.length || status === "unselected"}
              onClick={handleSave}
            >
              <span>{text("inquiry_save_btn_text")}</span>
            </button>
          </div>
          <button
            id={htmlIds.btn_users_inquiry_excel_download}
            disabled={massDownloadLoading || !data?.rows?.length}
            onClick={() => {
              getMassInquiry(
                {
                  searchKey: dataFilter?.searchKey,
                  startDate: dataFilter?.startDate,
                  endDate: dataFilter?.endDate,
                  status: dataFilter?.status,
                },
                {
                  onSuccess: (_data) => {
                    _data.rows && handleExcelDownload(_data?.rows);
                  },
                },
              );
            }}
            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
          >
            {massDownloadLoading && <Spinner />}{" "}
            <span>{text("users_inquiry_excel_download_title")}</span>
          </button>
        </div>
      </div>

      <div
        id={htmlIds.div_inquiry_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.id}
          rows={inquiriesWithIndex || []}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={inquiriesWithIndex.length}
          checkboxSelection
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
          apiRef={apiRef}
        />
      </div>

      {/* <ViewFilesModal
        ref={viewFilesModal}
        files={[{ file_name: "inquiry_images", file_url: modalFileUrl }]}
      /> */}
      <DataModal
        open={openResponseModal}
        onSubmit={handleSendResponse}
        onCancel={handleCancelSendResponse}
        setResponse={setResponse}
        response={response}
        error={responseError}
        content={content}
        submitLoading={isSubmitting}
        initialTab={initialTab}
        reply={reply}
        inquiryStatus={inquiryStatus}
        userInfo={userInfo}
        files={[{ file_name: "inquiry_images", file_url: modalFileUrl }]}
        inquiryTitle={inquiryTitle}
      />
    </div>
  );
}
