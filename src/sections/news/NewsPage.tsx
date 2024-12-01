/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataFilterType, DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useLocale } from "locale";
import { GridColDef, GridEventListener, GridSelectionModel } from "@mui/x-data-grid";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { NewsSaveModal, INewsSubmitData } from "./components";
import {
  useAddNews,
  useDeleteNews,
  useGetNews,
  useUpdateNews,
} from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import _debounce from "lodash/debounce";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import Image from "next/image";
import { toast } from "react-toastify";
import { INews } from "api/hooks/news/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import dayjs from "dayjs";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import Link from "next/link";
import { Box, IconButton, Tooltip } from "@mui/material";
import { AdsManagementStatsModal, AdsManagementStatsModalRef } from "@sections/ads-management/components";
import { matchesUrlPattern } from "@common/utils/helpers";
import axios from "axios";

const sharedColDef: GridColDef = {
  field: "",
  flex: 1,
};

function NewsScreen() {
  const { text } = useLocale();
  const { alertDialog, confirmDialog } = useDialog();

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const [statsUrl, setStatsUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [isNewsEditMode, setIsNewsEditMode] = useState(false);
  const [newsInitialData, setNewsInitialData] = useState<INews | null>(null);
  const [lastId, setLastId] = useState<string>();
  const [news, setNews] = useState<INews[]>([]);
  const [openNewsSaveModal, setOpenNewsSaveModal] = useState(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  // Added start
  const router = useRouter();
  const dataFilter: DataFilterType = router.query;

  // Added end
  const { data, isFetching, refetch } = useGetNews(
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
        setNews((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.news,
        ]);
      },
    },
  );

  const { mutateAsync: deleteNewsApi } = useDeleteNews();
  const { mutateAsync: addNewsApi, isLoading: isAddNewsLoading } = useAddNews();
  const { mutateAsync: updateNewsApi, isLoading: isUpdateNewsLoading } =
    useUpdateNews();

  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const viewStatsModal = useRef<AdsManagementStatsModalRef>(null);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("news_page_column_no"),
        type: "number",
        minWidth: 80,
      },
      {
        ...sharedColDef,
        field: "title",
        headerName: text("news_page_column_title"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "subtitle",
        headerName: text("news_page_column_description"),
        minWidth: 200,
      },
      {
        ...sharedColDef,
        field: "uuid",
        headerName: text("news_page_column_uuid"),
        minWidth: 300,
        renderCell: ({ value }) =>
          value && (
            <div className="flex w-full items-center justify-between">
              <span className="w-fit mr-5 truncate text-ellipsis">{value}</span>
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
        field: "url",
        headerName: `${text("news_page_column_url")}`,
        minWidth: 160,
        renderCell: ({ row }) => (
          <div className=" w-full flex items-center">
            {row.url ? (
              <Link 
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="w-fit truncate text-ellipsis hover:underline hover:text-blue-500"
              >
                {row.url}
              </Link>
            ):(
              "---"
            )}
            {row.url && (
              <>
                <IconButton onClick={() => copyToClipboard(row.url)} aria-label="copy icon">
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
                <Tooltip title={matchesUrlPattern(row?.url) ? text("view_ads_stats_tooltip") : text("view_ads_stats_invalid_url")} arrow placement="top">
                  <IconButton 
                    onClick={() => {
                      if(matchesUrlPattern(row?.url)){
                        setStatsUrl(row?.url);
                        setCreatedAt(row?.createdAt);
                        viewStatsModal.current?.open();
                      }
                    }}
                    className={`${matchesUrlPattern(row?.url) ? "cursor-pointer" : "opacity-20 cursor-not-allowed"}`}
                    >
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Image
                        alt=""
                        width={17}
                        height={17}
                        src="/images/stats.svg"
                      />
                    </Box>
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "image",
        headerName: text("news_page_column_image"),
        minWidth: 150,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md"
              onClick={() => {
                setModalFileUrl(row.imageUrl);
                viewFilesModal.current?.open();
              }}
              id={`${htmlIds.btn_news_report_view_report}${row.no}`}
            >
              {text("news_page_column_view")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "date",
        headerName: text("news_page_column_date"),
        minWidth: 200,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <p className="truncate">
              {dayjs(value, "YYYY.MM.DD").format("YYYY-MM-DD")}
            </p>
          ),
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: text("news_page_column_created_at"),
        minWidth: 150,
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
        field: "actions",
        filterable: false,
        headerName: text("news_page_column_actions"),
        minWidth: 200,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md mr-2"
              onClick={() => {
                setIsNewsEditMode(true);
                setNewsInitialData(row);
                setOpenNewsSaveModal(true);
              }}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("news_page_column_action_btn_edit")}
            </button>
            <button
              className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md  mr-2"
              onClick={() => handleDelete(row.uuid as string)}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("news_page_column_action_btn_delete")}
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const scrollToTop = () => {
    document
    ?.querySelector?.(".MuiDataGrid-virtualScroller")
    ?.scrollTo?.({ top: 0 });
  };

  const handleDelete = (id?: string) => {
    const newsCount = rowSelectionModel.length;

     const title = `${text("modal_form_delete_sub_title")} ${
     newsCount > 1
        ? `${rowSelectionModel.length} ${text(
            "deposit_information_status_selected",
          )}`
        : `${text("news")}?`
    }`;

    const content = `${text("popup_form_warning_msg")} ${
      rowSelectionModel.length > 1
        ? text("news_modal_delete_confirmation_multiple")
        : text("news_modal_delete_confirmation_single")
    } ${text("withdrawal_information_form_info_msg")}?`;

    confirmDialog({
      title: title,
      content: content,
      onOk: async () => {
        try {
          await deleteNewsApi({ id: id ? [id as string] : rowSelectionModel as string[] });
          toast.success(text("delete_news_success"));
          setRowSelectionModel([]);
          if (lastId !== undefined) {
            setLastId(undefined);
          } else {
            refetch();
          }
          scrollToTop();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            toast.error(text("delete_news_failure"));
            }
      },
    });
  };

  const handleModalClose = useCallback(() => {
    setOpenNewsSaveModal(false);
    setNewsInitialData(null);
    setIsNewsEditMode(false);
  }, []);

  const handleNewsSaveModalOk = async (data: INewsSubmitData) => {
    try {
      if (isNewsEditMode) {
        await updateNewsApi({
          ...data,
          id: newsInitialData?.uuid as string,
          date: dayjs(data.date).format("YYYY.MM.DD"),
        });
      } else {
        await addNewsApi({
          ...data,
          date: dayjs(data.date).format("YYYY.MM.DD"),
        });
      }
      alertDialog({
        title: "Saved",
      });
      setRowSelectionModel([]);
      handleModalClose();
      // refetch();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.error);
      } else {
        toast.error(text("toast_error_something_went_wrong_try_again"));
      }
    }
  };

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (news?.length > 0 && data?.hasNext) {
      //setPage((prev) => prev + 1);
      setLastId(data?.lastId);
    }
  }, [news?.length, data?.hasNext]);

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
  }, []);

  const newsWithIndex = useMemo(
    () => news.map((item, index) => ({ ...item, no: index + 1 })),
    [news],
  );

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
  } = useGridColumnChange("newsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  const _newsInitialValues = useMemo(() => {
    if (isNewsEditMode && newsInitialData) {
      return {
        title: newsInitialData.title,
        subtitle: newsInitialData.subtitle,
        url: newsInitialData.url,
        imageUrl: newsInitialData.imageUrl,
        date: newsInitialData.date,
      };
    }
    return undefined;
  }, [isNewsEditMode, newsInitialData]);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{text("news_page_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("news_page_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex flex-wrap justify-between gap-2 ">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-end items-center py-3">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <p className="text-neutral-500">{`${rowSelectionModel.length} selected`}</p>
          <button
            id={htmlIds.btn_bug_report_delete_request}
            disabled={!rowSelectionModel.length}
            onClick={() => handleDelete()}
            className="flex items-center justify-center text-sm px-4 h-10 disabled:bg-red-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-red-500 text-white rounded-md"
          >
            <span>{text("super_save_bug_report_modal_delete")}</span>
          </button>
          <div>
            <button
              id={htmlIds.btn_platform_add_new_platform}
              className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
              onClick={() => setOpenNewsSaveModal(true)}
            >
              <PlusIcon className="w-5 stroke-2 mr-2" />
              <span>{text("add_news")}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={htmlIds.div_bug_report_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.uuid}
          rows={newsWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={newsWithIndex.length}
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
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <NewsSaveModal
        open={openNewsSaveModal}
        onOk={handleNewsSaveModalOk}
        onCancel={handleModalClose}
        isSubmitting={isAddNewsLoading || isUpdateNewsLoading}
        isEditMode={isNewsEditMode}
        initialValues={_newsInitialValues}
      />
      <ViewFilesModal
        ref={viewFilesModal}
        files={[{ file_name: "news_images", file_url: modalFileUrl }]}
      />
      <AdsManagementStatsModal
        ref={viewStatsModal}
        slugOrUrl={statsUrl}
        startAt={createdAt}
      />
    </div>
  );
}

export default NewsScreen;
