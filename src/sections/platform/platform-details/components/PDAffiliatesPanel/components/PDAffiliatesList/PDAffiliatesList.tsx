import React, {
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PlatformAffiliateType,
  useGetPlatformAffiliateMutation,
  useGetPlatformAffiliates,
  usePostAdminHistoryLog,
} from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { IPDAffiliatesListProps, IPDAffiliatesListRef } from "./types";
import { DateFormatter, Pagination, Spinner } from "@common/components";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { htmlIds } from "@cypress/utils/ids";
import { customisedTableClasses } from "@common/constants/classes";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";
import { Box, Button, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { arrayToString, useCopyToClipboard } from "@common/utils/helpers";
import { formatDate, formatDateAndTime } from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import { toast } from "react-toastify";
import Image from "next/image";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { useAuth } from "@common/context";
import { jsonToExcelDownload } from "@common/utils/excelutil";

type IParams = {
  platform_id: string;
  approved?: boolean;
  activated?: boolean;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

const PDAffiliatesList = forwardRef(
  (props: IPDAffiliatesListProps, ref: Ref<IPDAffiliatesListRef>) => {
    const {
      platform_id,
      name,
      city,
      categories,
      actionMode,
      activated,
      isWaiting,
      onUpdateStore,
      onChangeStoreStatus,
      onDeleteStore,
    } = props;
    const { text: t } = useLocale();
    const { timezone } = useTimezone();
    const { userRole,userRoleV2 } = useAuth();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [showToolbar, setShowToolbar] = useState<boolean>(false);
    const viewCompanyDocumentFilesModal = useRef<ViewFilesModalRef>(null);
    const viewCompanyImageFilesModal = useRef<ViewFilesModalRef>(null);
    const [modalFileUrl, setModalFileUrl] = useState("");
    const [modalComapnyFileUrl, setModalCompanyFileUrl] = useState("");

    const copyToClipboard = useCopyToClipboard();

    /* DataGrid Columns Reorder & Sort Handling Start */
    const columnStateLocalStorageKey = `${actionMode}_affiliate_store_columns`;

    const {
      handleColumnChange,
      handleSaveView,
      handleResetDefault,
      restoreOrder,
      openConfirmDialog,
      apiRef,
      columnCurrentState,
      setOpenConfirmDialog,
    } = useGridColumnChange(columnStateLocalStorageKey);

    useEffect(() => {
      restoreOrder();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /* DataGrid Columns Reorder & Sort Handling End */

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const params: IParams = { platform_id };

    if (isWaiting) {
      params.approved = false;
      params.activated = false;
    } else if (activated) {
      params.activated = true;
    } else {
      params.activated = false;
      params.approved = true;
    }

    const {
      mutateAsync: getMassAffiliateStoreMutation,
      isLoading: massAffiliateStoreLoading,
    } = useGetPlatformAffiliateMutation();
    const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();
    const {
      isFetching: isLoading,
      refetch,
      data,
    } = useGetPlatformAffiliates(
      {
        ...params,
        version: 2,
        limit,
        page,
        name,
        city: t(city as LocalKeys, { locale: "en_US" }),
        category: categories,
      },
      {
        queryKey: [
          platform_id,
          {
            ...(isWaiting
              ? { approved: false, activated: false }
              : activated
              ? { activated: true }
              : { activated: false, approved: true }),
          },
          limit,
          page,
          name,
          city,
          categories,
        ],
        /* select: (response) => {
            const filteredData = response?.data.filter((el) =>
              el.name.toLocaleLowerCase().includes(searchText),
          );
          return { ...response, data: filteredData };
        }, */
      },
    );
    const affiliateStoresWithIndex = useMemo(
      () =>
        data?.data?.map((item, index) => ({
          ...item,
          no: limit * (page - 1) + index + 1,
        })) || [],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [data?.data, limit, page, isLoading],
    );

    useImperativeHandle(ref, () => ({
      refetch: () => {
        refetch();
      },
    }));

    const columns: GridColDef[] = useMemo(
      () => [
        {
          ...sharedColDef,
          field: "no",
          headerName: `${t("affiliate_store_column_header_no")}`,
          minWidth: 70,
          disableReorder: true,
        },
        {
          ...sharedColDef,
          field: "name",
          headerName: `${t("affiliate_store_column_header_name")}`,
          minWidth: 200,
          renderCell: ({ row }) => (
            <div className="truncate">
              <span>{row.name || "---"}</span>
            </div>
          ),
        },
        {
          ...sharedColDef,
          field: "code",
          headerName: `${t("affiliate_store_column_header_business_number")}`,
          minWidth: 150,
          renderCell: ({ row }) => {
            const codeParts = (row.code || "").split("_");
            const oldCode = codeParts.length > 0 ? codeParts[0] : "---";
            return (
              <div className="truncate">
                <span>{actionMode === "waiting" ? oldCode : row.code}</span>
              </div>
            );
          },
        },
        {
          ...sharedColDef,
          field: "new_business_field",
          headerName: `${t(
            "affiliate_store_column_header_new_business_number",
          )}`,
          minWidth: 170,
          renderCell: ({ row }) => {
            const codeParts = (row.code || "").split("_");
            const newCode = codeParts.length > 1 ? codeParts[1] : "---";

            return (
              <div className="truncate">
                <span>{newCode}</span>
              </div>
            );
          },
        },
        {
          ...sharedColDef,
          field: "city",
          headerName: `${t("affiliate_store_column_header_city")}`,
          minWidth: 100,
          renderCell: ({ row }) => (
            <div className="truncate">
              <span>{row.city || "---"}</span>
            </div>
          ),
        },
        {
          ...sharedColDef,
          field: "address",
          headerName: `${t("affiliate_store_column_header_address")}`,
          minWidth: 200,
          renderCell: ({ row }) => (
            <div className="truncate">
              <span>{row.address || "---"}</span>
            </div>
          ),
        },
        {
          ...sharedColDef,
          field: "company_image",
          headerName: `${t("affiliate_store_column_header_company_image")}`,
          minWidth: 120,
          renderCell: ({ row }) => (
            <div className="flex items-center justify-center w-full">
              <button
                className={`flex items-center text-xs px-5 py-1.5 rounded ${
                  row.image_url ? "bg-blue-500 text-white" : "bg-blue-300 text-neutral-100 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (row.image_url) {
                  setModalFileUrl(row.image_url);
                  viewCompanyImageFilesModal.current?.open();
                  }
                }}
                disabled={!row.image_url}
              >
                {t("popup_page_column_view")}
              </button>
            </div>
          ),
        },
        {
          ...sharedColDef,
          field: "company_document",
          headerName: `${t("affiliate_store_column_header_company_document")}`,
          minWidth: 170,
          renderCell: ({ row }) => (
            <div className={`flex items-center justify-center w-full ${!row.company_document && "cursor-not-allowed"}`}>
              <Button
                onClick={() => {
                  if (row.company_document) {
                    setModalCompanyFileUrl(row.company_document);
                    viewCompanyDocumentFilesModal.current?.open();
                  }
                }}
                disabled={!row.company_document}
                variant="outlined"
                startIcon={<VisibilityOutlinedIcon />}
              >
                {t("basic_information_view_files")}
              </Button>
            </div>
          ),
        },   
        {
          ...sharedColDef,
          field: "createdAt",
          headerName: `${t("affiliate_store_column_header_created_at")}`,
          minWidth: 120,
          renderCell: ({ value }) =>
            value && (
              <span className="whitespace-normal w-fit">
                <DateFormatter value={value} breakLine />
              </span>
            ),
        },
        {
          ...sharedColDef,
          field: "updatedAt",
          headerName: `${t("affiliate_store_column_header_updated_at")}`,
          minWidth: 120,
          renderCell: ({ value }) =>
            value && (
              <span className="whitespace-normal w-fit ">
                <DateFormatter value={value} breakLine />
              </span>
            ),
        },
        ...(userRole === 0 || Object.keys(userRoleV2 || {}).includes("platform")
          ? [
              {
                ...sharedColDef,
                field: "actions",
                headerName: `${t("affiliate_store_column_header_actions")}`,
                minWidth: actionMode === "waiting" ? 200 : 250,
                renderCell: ({ row }) => (
                  <div className="flex">
                    <button
                      className="flex items-center text-xs px-2 h-6 bg-blue-500 text-white rounded-md mr-2"
                      onClick={() => onUpdateStore(row)}
                      id={`${htmlIds.btn_affiliate_store_view_action_edit}${row.code}`}
                    >
                      {t("affiliate_update_disable")}
                    </button>
                    <button
                      className={`flex items-center text-xs px-2 h-6 rounded-md mr-2 ${
                        row.activated === false
                          ? "border border-green-600 text-green-600"
                          : "border border-red-600 text-red-600"
                      }`}
                      onClick={() => onChangeStoreStatus(row)}
                      id={`${htmlIds.btn_affiliate_store_view_action_edit}${row.code}`}
                    >
                      {actionMode === "activated" &&
                        t("affiliate_register_disable")}
                      {actionMode === "deactivated" &&
                        t("affiliate_register_enable")}
                      {actionMode === "waiting" &&
                        t("affiliate_register_approve")}
                    </button>
                    {actionMode === "waiting" ? (
                      <button
                        className="flex items-center text-xs px-2 h-6 border border-red-600 text-red-600 rounded-md mr-2"
                        onClick={() => onChangeStoreStatus(row, true)}
                        id={`${htmlIds.btn_affiliate_store_view_action_edit}${row.code}`}
                      >
                        {t("affiliate_register_deny")}
                      </button>
                    ) : (
                      <button
                        className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md"
                        onClick={() => onDeleteStore(row, true)}
                        id={`${htmlIds.btn_affiliate_store_view_action_edit}${row.code}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ),
              } as GridColDef,
            ]
          : []),
        {
          ...sharedColDef,
          field: "user_id",
          headerName: `${t("affiliate_store_column_header_user_id")}`,
          minWidth: 150,
          renderCell: ({ value }) => (
            <div className="flex w-full items-center">
              {value ? (
                <>
                  <span className="w-fit truncate text-ellipsis">{value}</span>
                  <IconButton onClick={() => copyToClipboard(value)} aria-label="copy icon">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
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
                "---"
              )}
            </div>
          ),
        },
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [actionMode, onChangeStoreStatus, onUpdateStore, t, isLoading],
    );

    // const iconClassForIgnoreClick = "affiliateInfoIcon";
    useEffect(() => {
      if (city || name) {
        setPage(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [city, name]);

    const exportDataToExcel = useCallback(
      (allAffiliateStore: PlatformAffiliateType[]) => {
        jsonToExcelDownload(
          allAffiliateStore.map((item, index) => ({
            [t("affiliate_store_column_header_no")]: index + 1,
            [t("affiliate_store_column_header_name")]: item.name || "---",
            [t("affiliate_store_column_header_business_number")]:
              actionMode === "waiting"
                ? (item.code || "").split("_")[0]
                : item.code || "---",
            ...(actionMode === "waiting" && {
              [t("affiliate_store_column_header_new_business_number")]:
                (item.code || "").split("_")[1] || "---",
            }),
            [t("affiliate_store_column_header_city")]: item.city || "---",
            [t("affiliate_store_column_header_address")]: item.address || "---",
            [t("affiliate_store_column_header_company_image")]:
              item.image_url || "---",
            [t("affiliate_store_column_header_company_document")]:
              item.company_document || "---",
            [t("affiliate_store_column_header_created_at")]: item.createdAt
              ? formatDateAndTime(
                  item.createdAt.toString(),
                  "YYYY-MM-DD HH:mm:ss",
                  timezone,
                )
              : "---",
            [t("affiliate_store_column_header_updated_at")]: item.updatedAt
              ? formatDateAndTime(
                  item.updatedAt.toString(),
                  "YYYY-MM-DD HH:mm:ss",
                  timezone,
                )
              : "---",
            [t("affiliate_store_column_header_user_id")]: item.user_id || "---",
          })),
          `${arrayToString([
            t("affiliate_store_excel_download_file_name"),
            formatDate(new Date(), false),
          ])}`,
        );
        postAdminHistoryLog({
          content_en: "Excel Download",
          content_kr: "Excel Download",
          uuid: arrayToString([
            t("affiliate_store_excel_download_file_name"),
            formatDate(new Date()) + ".xlsx",
          ]),
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [t, timezone],
    );

    const handleExportStoreData = useCallback(async () => {
      const massAffiliateStoreRes = await getMassAffiliateStoreMutation({
        ...params,
        version: 2,
        name,
        city,
        category: categories,
      }).catch((err) => {
        toast.error(
          err.response?.data?.message || "Error while exporting data",
        );
      });

      if (massAffiliateStoreRes) {
        exportDataToExcel(massAffiliateStoreRes.data);
      }
    }, [
      city,
      exportDataToExcel,
      getMassAffiliateStoreMutation,
      name,
      params,
      categories,
    ]);
    return (
      <div>
        <div className="flex flex-col min-[580px]:flex-row gap-2 justify-between items-end md:items-center py-4 md:py-3">
          <div className="flex">
            {Object.keys(columnCurrentState).length > 0 && (
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            )}
          </div>
          <div className="flex">
            <ShowToolbar
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
            <button
              id={htmlIds.btn_store_excel_download}
              disabled={
                massAffiliateStoreLoading || !affiliateStoresWithIndex?.length
              }
              onClick={() => handleExportStoreData()}
              className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed "
            >
              {massAffiliateStoreLoading && <Spinner />}{" "}
              <span>{t("affiliate_store_excel_download_title")}</span>
            </button>
          </div>
        </div>
        <div
          id={htmlIds.div_affiliate_store_table_container}
          className="w-full bg-white tableContainer"
        >
          <DataGridPro
            getRowId={(row) => row.code + "_" + row.no}
            rows={affiliateStoresWithIndex}
            columns={columns}
            paginationMode="server"
            loading={isLoading}
            rowCount={affiliateStoresWithIndex.length || 0}
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
            initialState={{
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  new_business_field: actionMode === "waiting",
                },
              },
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
        <ViewFilesModal
          ref={viewCompanyImageFilesModal}
          files={[{ file_name: "popup_images", file_url: modalFileUrl }]}
        />
        <ViewFilesModal
          ref={viewCompanyDocumentFilesModal}
          files={[
            {
              file_name: "company_document",
              file_url: modalComapnyFileUrl,
            },
          ]}
        />
        <ConfirmationDialog
          openConfirmDialog={openConfirmDialog}
          setOpenConfirmDialog={setOpenConfirmDialog}
          onYesHandler={handleSaveView}
        />
      </div>
    );
  },
);

PDAffiliatesList.displayName = "PDAffiliatesList";

export default PDAffiliatesList;
