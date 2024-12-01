import { DataFilterType } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useLocale } from "locale";
import { Box, IconButton, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { PopUpSaveModal } from "./components";
import { IPopUpSubmitData } from "./components/PopUpSaveModal/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  useGetPopUps,
  useAddPopUp,
  useDeletePopUp,
  useUpdatePopUp,
} from "api/hooks/popups";
import { IPopUp } from "api/hooks/popups/types";
import { htmlIds } from "@cypress/utils/ids";
import {
  getErrorMessage,
  resetMUIToolbarFilter,
  scrollToTop,
} from "@common/utils/helpers";
import Image from "next/image";
import { toast } from "react-toastify";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { AdsManagementStatsModal, AdsManagementStatsModalRef } from "@sections/ads-management/components";
import { matchesUrlPattern } from "@common/utils/helpers";
import Link from "next/link";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function PopUpsScreen() {
  const { text } = useLocale();
  const { confirmDialog } = useDialog();
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const [statsUrl, setStatsUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [openPopUpSaveModal, setOpenPopUpSaveModal] = useState(false);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const viewStatsModal = useRef<AdsManagementStatsModalRef>(null);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const [lastId, setLastId] = useState<string>();
  const [filteredPopups, setFilteredPopups] = useState<DataFilterType>();
  const [popups, setPopUps] = useState<IPopUp[]>([]);

  const [isPopUpEditMode, setIsPopUpEditMode] = useState(false);
  const [popUpInitialData, setPopUpInitialData] = useState<IPopUp | null>(null);

  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isFetching, refetch } = useGetPopUps(
    {
      limit: 25,
      lastId,
      searchValue:
        (filteredPopups?.searchKey?.length || 0) > 0
          ? filteredPopups?.searchKey
          : undefined,
      ...(filteredPopups?.startDate && {
        from_date: dayjs(filteredPopups?.startDate).format("YYYY-MM-DD"),
        to_date: dayjs(filteredPopups?.endDate).format("YYYY-MM-DD"),
      }),
    },
    {
      onSuccess: (data) => {
        if (isRefetching) {
          setPopUps([...data.popups]);
          setIsRefetching(false);
        } else {
          setPopUps((prev) => [
            ...(lastId !== undefined ? prev : []),
            ...data.popups,
          ]);
        }
      },
    },
  );

  const handleRefetch = () => {
    setIsRefetching(false);
    setLastId(undefined);
    refetch();
  };

  const handleViewFileModal = (imageUrl: string) => {
    if (!imageUrl) return;

    setModalFileUrl(imageUrl);
    viewFilesModal.current?.open();
  };

  const { mutateAsync: deletePopUpApi } = useDeletePopUp();
  const { mutateAsync: addPopUpApi, isLoading: isAddPopUpLoading } =
    useAddPopUp();
  const { mutateAsync: updatePopUpApi, isLoading: isUpdatePopUpLoading } =
    useUpdatePopUp();

  const columns: GridColDef[] = useMemo(
    () => [
        {
        ...sharedColDef,
        field: "no",
        headerName: text("popups_list_no_column_title"),
        minWidth: 50,
        type: "number",
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "title",
        headerName: text("popups_list_title_column_title"),
        minWidth: 250,
        renderCell: ({ row }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {row.title}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "content",
        headerName: text("popups_list_content_column_title"),
        minWidth: 250,
        renderCell: ({ row }) => (
          <div className="flex w-full items-center">
            <span className="w-fit truncate">{row.content}</span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "link",
        headerName: text("popups_list_link_column_title"),
        minWidth: 200,
        renderCell: ({ row }) => (
          <div className=" w-full flex items-center justify-between">
            {row.link ? (
              <Link
                href={row.link}
                target="_blank"
                rel="noreferrer"
                className="w-fit truncate text-ellipsis hover:underline hover:text-blue-500"
              >
                {row.link}
              </Link>
            ) : (
              "---"
            )}
            {row.link && (
              <>
                <IconButton onClick={() => copyToClipboard(row.link)} aria-label="copy icon">
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
                <Tooltip title={matchesUrlPattern(row?.link) ? text("view_ads_stats_tooltip") : text("view_ads_stats_invalid_url")} arrow placement="top">
                  <IconButton
                    onClick={() => {
                      if (matchesUrlPattern(row?.link)) {
                        setStatsUrl(row?.link);
                        setCreatedAt(row?.createdAt);
                        viewStatsModal.current?.open();
                      }
                    }}
                    className={`${matchesUrlPattern(row?.link) ? "cursor-pointer" : "opacity-20 cursor-not-allowed"}`}
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
        field: "imageUrl",
        headerName: text("popups_list_image_column_title"),
        minWidth: 100,
        filterable: false,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md disabled:opacity-20 disabled:cursor-not-allowed"
              onClick={() => handleViewFileModal(row.imageUrl)}
              id={`${htmlIds.btn_news_report_view_report}${row.no}`}
              disabled={!row.imageUrl}
            >
              {text("popup_page_column_view")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "startDate",
        headerName: text("popups_list_start_date_column_title"),
        minWidth: 100,
        type: "date",
        renderCell: ({ row }) =>
          row && (
            <p className="truncate">
              {dayjs(row.startDate, "YYYY-MM-DD").format("YYYY-MM-DD")}
            </p>
          ),
      },
      {
        ...sharedColDef,
        field: "endDate",
        headerName: text("popups_list_end_date_column_title"),
        minWidth: 100,
        type: "date",
        renderCell: ({ row }) =>
          row && (
            <p className="truncate">
              {dayjs(row.endDate, "YYYY-MM-DD").format("YYYY-MM-DD")}
            </p>
          ),
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("popups_list_action_column_title"),
        minWidth: 200,
        filterable: false,
        sortable: false,
        width: 200,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md mr-2"
              onClick={() => {
                setIsPopUpEditMode(true);
                setPopUpInitialData(row);
                setOpenPopUpSaveModal(true);
              }}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("popups_page_column_action_btn_edit")}
            </button>
            <button
              className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md"
              onClick={() => handleDelete(row.uuid as string)}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("popups_page_column_action_btn_delete")}
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const handleDelete = (id?: string) => {
    const popupsCount = rowSelectionModel.length;
    const popupOrPopups = popupsCount > 1 ? "popups" : "popup";
    confirmDialog({
      title: `${text("popup_form_delete")} ${popupsCount > 1 ? popupsCount : ""} ${text(popupOrPopups)}?`,
      content: `${text("popup_form_warning_msg")} ${popupsCount > 1 ? text("multiple_popup_selected") : text("single_popup_selected")}?  ${text("popup_form_info_msg")} `,
      onOk: async () => {
        try {
          await deletePopUpApi({ id: id ? [id as string] : rowSelectionModel as string[] });
          toast.success(`${text(popupOrPopups)} ${text("delete_popup_success")}`);
          setRowSelectionModel([]);
          if (lastId !== undefined) {
            setLastId(undefined);
          } else {
            handleRefetch();
            scrollToTop();
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast.error(error?.response?.data?.result || `${text(popupOrPopups)} ${text("delete_popup_failure")}`);
        }
      },
    });
  };

  const handlePopUpSaveModalOk = async (data: IPopUpSubmitData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("link", data.link);
      formData.append("startDate", dayjs(data.startDate).format("YYYY-MM-DD"));
      formData.append("endDate", dayjs(data.endDate).format("YYYY-MM-DD"));
      formData.append("content", data.content);
      if (data.image) {
        formData.append("image", data.image);
      }
      if (isPopUpEditMode) {
        await updatePopUpApi({
          id: popUpInitialData?.uuid as string,
          formData,
        });
        toast(text("popups_list_page_item_updated_success"), {
          type: "success",
        });
      } else {
        await addPopUpApi(formData);
        setLastId(undefined);
        toast(text("popups_list_page_item_created_success"), {
          type: "success",
        });
      }
      setRowSelectionModel([]);
      handleModalClose();
      handleRefetch();
      scrollToTop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(getErrorMessage(err), { type: "error" });
    }
  };

  const _popUpInitialValues = useMemo(() => {
    if (isPopUpEditMode && popUpInitialData) {
      return {
        title: popUpInitialData.title,
        content: popUpInitialData.content,
        link: popUpInitialData.link,
        startDate: popUpInitialData.startDate,
        endDate: popUpInitialData.endDate,
      };
    }
    return undefined;
  }, [isPopUpEditMode, popUpInitialData]);


  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setFilteredPopups(e);
  }, []);

  const popUpsDataWithIndex = useMemo(
    () => popups.map((item, index) => ({ ...item, no: index + 1 })),
    [popups],
  );

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
    if (popups?.length > 0 && data?.hasNext) {
      setLastId(data?.newLastId);
    }
  }, [data?.hasNext, data?.newLastId, popups?.length]);

  const handleModalClose = useCallback(() => {
    setOpenPopUpSaveModal(false);
    setPopUpInitialData(null);
    setIsPopUpEditMode(false);
  }, []);

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("popUpColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, filteredPopups]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("popups_list_page_header")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("popups_list_page_header_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex justify-between gap-2 flex-wrap p-1">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex gap-2 justify-end items-center py-3 flex-wrap">
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
              onClick={() => setOpenPopUpSaveModal(true)}
            >
              <PlusIcon className="w-5 stroke-2 mr-2" />
              <span>{text("create_popup")}</span>
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
          rows={popUpsDataWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={popUpsDataWithIndex.length}
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
      <ViewFilesModal
        ref={viewFilesModal}
        files={[{ file_name: "popup_images", file_url: modalFileUrl }]}
      />
      <PopUpSaveModal
        open={openPopUpSaveModal}
        onOk={handlePopUpSaveModalOk}
        onCancel={handleModalClose}
        isSubmitting={isAddPopUpLoading || isUpdatePopUpLoading}
        isEditMode={isPopUpEditMode}
        initialValues={_popUpInitialValues}
      />
      <AdsManagementStatsModal
        ref={viewStatsModal}
        slugOrUrl={statsUrl}
        startAt={createdAt}
      />
    </div>
  );
}

export default PopUpsScreen;
