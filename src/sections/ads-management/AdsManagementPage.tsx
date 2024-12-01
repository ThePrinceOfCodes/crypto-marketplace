import { DataFilterType } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import { useLocale } from "locale";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGridPro, GridColDef, GridEventListener, GridSelectionModel } from "@mui/x-data-grid-pro";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { AdsManagementSaveModal } from "./components";
import { IAdsManagementSubmitData } from "./components/AdsManagementSaveModal/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { htmlIds } from "@cypress/utils/ids";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import Image from "next/image";
import { toast } from "react-toastify";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import { ViewFilesModal, ViewFilesModalRef } from "@sections/user-details/components";
import { AdsManagementStatsModal, AdsManagementStatsModalRef } from "@sections/ads-management/components";
import { useAddAds, useDeleteAds, useGetAllAds, useUpdateAds } from "api/hooks";
import { IAds } from "api/hooks/ads-management/types";
import dayjs from "dayjs";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import Link from "next/link";
import { matchesUrlPattern } from "@common/utils/helpers";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function AdsManagementPage() {
  const { text } = useLocale();
  const { alertDialog, confirmDialog } = useDialog();
  const [modalFileUrl, setModalFileUrl] = useState<string>("");
  const [openAdsManagementSaveModal, setOpenAdsManagementSaveModal] =
    useState(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const viewStatsModal = useRef<AdsManagementStatsModalRef>(null);

  const copyToClipboard = (textToCopy: string) => {
    navigator?.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
    });
  };

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const [lastId, setLastId] = useState<string>();
  const [statsUrl, setStatsUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [filteredAds, setFilteredAds] = useState<DataFilterType>();
  const [allAds, setAllAds] = useState<IAds[]>([]);

  const [isAdsEditMode, setIsAdsEditMode] = useState(false);
  const [adsInitialData, setAdsInitialData] = useState<IAds | null>(null);

  const { data, isFetching, refetch } = useGetAllAds(
    {
      limit: 25,
      lastId,
      searchKey:
        (filteredAds?.searchKey?.length || 0) > 0
          ? filteredAds?.searchKey
          : undefined,
      ...(filteredAds?.startDate && {
        date_from: dayjs(filteredAds?.startDate).format("YYYY-MM-DD"),
        date_to: dayjs(filteredAds?.endDate).format("YYYY-MM-DD"),
      }),
    },
    {
      onSuccess: (data) => {
        setAllAds((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...data.rows,
        ]);
      },
    },
  );

  const { mutateAsync: deleteAdsApi } = useDeleteAds();
  const { mutateAsync: addAdsUpApi, isLoading: isAddAdsUpLoading } =
    useAddAds();
  const { mutateAsync: updateAdsApi, isLoading: isUpdateAdsLoading } =
    useUpdateAds();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("ads_management_list_no_column_title"),
        minWidth: 80,
        type: "number",
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "text1",
        headerName: text("ads_management_list_text1_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "text2",
        headerName: text("ads_management_list_text2_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "text3",
        headerName: text("ads_management_list_text3_column_title"),
        minWidth: 200,
        renderCell: ({ value }) => (
          <div className="w-full flex items-center">
            <span className="w-fit truncate">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "type",
        headerName: text("ads_management_list_type_column_title"),
        minWidth: 160,
        renderCell: ({ value }) => (
          <div className="flex items-center">
            <span className="w-[100px] truncate text-ellipsis">
              {value || "---"}
            </span>
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "link",
        headerName: text("ads_management_list_link_column_title"),
        minWidth: 160,
        renderCell: ({ row }) => (
          <div className="flex w-full items-center justify-between">
            {row.link ? (
              <Link
                href={row.link}
                target="_blank"
                rel="noreferrer"
                className="w-fit truncate text-ellipsis hover:underline hover:text-blue-500"
              >
                {row.link}
              </Link>
            ):(
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
                      if(matchesUrlPattern(row?.link)){
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
        field: "image",
        headerName: text("ads_management_list_image_column_title"),
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          return (
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md"
              onClick={() => {
                setModalFileUrl(row.image);
                viewFilesModal.current?.open();
              }}
              id={`${htmlIds.btn_news_report_view_report}${row.no}`}
              disabled={!row?.image}
            >
              {text("ads_management_page_column_view")}
            </button>
          );
        },
      },
      {
        ...sharedColDef,
        field: "action",
        headerName: text("ads_management_list_action_column_title"),
        minWidth: 250,
        width: 250,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <div className="flex">
            <button
              className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md mr-2"
              onClick={() => {
                setIsAdsEditMode(true);
                setAdsInitialData(row);
                setOpenAdsManagementSaveModal(true);
              }}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("ads_management_list_action_column_edit")}
            </button>
            <button
              className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md"
              onClick={() => handleDelete(row.uuid as string)}
              id={`${htmlIds.btn_news_view_action_edit}${row.no}`}
            >
              {text("ads_management_list_action_column_delete")}
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
    const adsCount = rowSelectionModel.length;
    const adOrAds = adsCount > 1 ? "ads_management_ads" : "ads_management_ad";
    const isSingleDelete = id !== undefined;
    
    const title = `${text("modal_form_delete_sub_title")} ${
      adsCount > 1
        ? `${rowSelectionModel.length} ${text(
            "deposit_information_status_selected",
          )}`
        : `${text(adOrAds)}?`
    }`;

    const content = `${text("popup_form_warning_msg")} ${
      rowSelectionModel.length > 1
        ? text("ads_management_modal_delete_confirmation_multiple")
        : text("ads_management_modal_delete_confirmation_single")
    } ${text("withdrawal_information_form_info_msg")}?`;
       
    confirmDialog({
        title: title,
       content: content,
      onOk: async () => {
        try {
          const id_list = isSingleDelete ? [id] : (rowSelectionModel as string[]);
          await deleteAdsApi({ id: id_list });
          toast.success(`${text(adOrAds)} ${text("delete_ad_success")}`);
          setRowSelectionModel([]);
          if (lastId !== undefined) {
            setLastId(undefined);
          } else {
            refetch();
          }
          scrollToTop();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(error?.response?.data?.result || `${text(adOrAds)} ${text("delete_popup_failure")}`);
        }
      },
    });
  };

  const handleAdsManagementSaveModalOk = async (
    data: IAdsManagementSubmitData,
  ) => {
    try {
      const formData = new FormData();
      formData.append("type", data.type.toString());
      if (data.type === 1) {
        formData.append("text1", data.text1);
        formData.append("text2", data.text2);
        formData.append("text3", data.text3);
      }
      formData.append("link", data.link);
      if (data.image) {
        formData.append("image", data.image);
      }
      if (isAdsEditMode) {
        await updateAdsApi({
          id: adsInitialData?.uuid as string,
          adData: {
            text1: data.text1,
            text2: data.text2,
            text3: data.text3,
            type: +data.type,
            link: data.link,
          },
        });
      } else {
        await addAdsUpApi(formData);
      }
      toast("Success!", { type: "success" });
      setRowSelectionModel([]);
      handleModalClose();
      setLastId(undefined);
      refetch();
    } catch (error) {
      //
    }
  };

  const _adsInitialValues = useMemo(() => {
    if (isAdsEditMode && adsInitialData) {
      return {
        type: adsInitialData.type,
        text1: adsInitialData.text1,
        text2: adsInitialData.text2,
        text3: adsInitialData.text3,
        link: adsInitialData.link,
      };
    }
    return undefined;
  }, [isAdsEditMode, adsInitialData]);


  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    setLastId(undefined);
    setFilteredAds(e);
  }, []);

  const adsDataWithIndex = useMemo(
    () => allAds.map((item, index) => ({ ...item, no: index + 1 })),
    [allAds],
  );

   const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (allAds?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId); 
    }
   }, [allAds?.length, data?.hasNext, data?.lastId]); 


  const handleModalClose = useCallback(() => {
    setOpenAdsManagementSaveModal(false);
    setAdsInitialData(null);
    setIsAdsEditMode(false);
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
  } = useGridColumnChange("adsColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, filteredAds]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-3 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">
          {text("ads_management_list_page_header")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("ads_management_list_page_header_subtitle")}
        </span>
      </div>

      <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />

      <div className="flex justify-between flex-wrap p-1">
        <div className="flex items-center">
          {Object.keys(columnCurrentState).length > 0 && (
            <SaveNResetButtons
              saveHandler={() => setOpenConfirmDialog(true)}
              resetHandler={handleResetDefault}
            />
          )}
        </div>
        <div className="flex gap-3 justify-end items-center py-3 flex-wrap">
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
              onClick={() => setOpenAdsManagementSaveModal(true)}
            >
              <PlusIcon className="w-5 stroke-2 mr-2" />
              <span>{text("create_ads_management")}</span>
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
          rows={adsDataWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          rowCount={adsDataWithIndex.length}
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
        files={[{ file_name: "ads_images", file_url: modalFileUrl }]}
      />

      <AdsManagementSaveModal
        open={openAdsManagementSaveModal}
        onOk={handleAdsManagementSaveModalOk}
        onCancel={handleModalClose}
        isSubmitting={isAddAdsUpLoading || isUpdateAdsLoading}
        isEditMode={isAdsEditMode}
        initialValues={_adsInitialValues}
      />

      <AdsManagementStatsModal
        ref={viewStatsModal}
        slugOrUrl={statsUrl}
        startAt={createdAt}
      />
    </div>
  );
}

export default AdsManagementPage;
