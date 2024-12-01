import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import _debounce from "lodash/debounce";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGridPro, GridColDef, GridEventListener, koKR  } from "@mui/x-data-grid-pro";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import { useLocale, LocaleEnum } from "locale";
import { useAuth } from "@common/context";
import { htmlIds } from "@cypress/utils/ids";
import { ShowEmail } from "@common/components";
import { ButtonAddPlatform } from "./components";
import { SearchBox } from "@common/components/SearchBox";
import { DateFormatter } from "@common/components/DateFormatter";
import { customisedTableClasses } from "@common/constants/classes";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { IPlatforms, useGetAllPlatforms, useGetUserPlatforms } from "api/hooks";
import { CustomImage } from "@common/components/CustomImage";
import { AdsManagementStatsModal, AdsManagementStatsModalRef } from "@sections/ads-management/components";
import { matchesUrlPattern } from "@common/utils/helpers";


const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  flex: 1,
};

function PlatformsPage() {
  const { text, locale } = useLocale();
  const { userRole, hasAuth, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [lastId, setLastId] = useState<string>();
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>("");
  const [statsUrl, setStatsUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [platforms, setPlatforms] = useState<IPlatforms[]>([]);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const viewStatsModal = useRef<AdsManagementStatsModalRef>(null);

  const {
    data: allPlatformsData,
    isLoading: isAllPlatformLoading,
    isFetching: isAllPlatformFetching,
  } = useGetAllPlatforms(
    { limit: 25,lastId, searchKey },
    {
      enabled: hasAuth("platform") && isAuthenticated,
      onSuccess: (data) => {
         if (lastId !== undefined) {
            setPlatforms((prev) => [...prev, ...data.platforms]);
          } else {
            setPlatforms(data.platforms);
          }
      },
    },
  );

  const {
    data: userPlatforms,
    isLoading: isLoadingUserPlatforms,
    isFetching: isFetchingUserPlatforms,
  } = useGetUserPlatforms(
    { limit: 25, lastId, searchKey },
    {
      enabled: !hasAuth("platform") && isAuthenticated,
      onSuccess: (data) => {
          if (lastId !== undefined) {
            setPlatforms((prev) => [...prev, ...data.platforms]);
          } else {
            setPlatforms(data.platforms);
          }
      },
    },
  );

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("add_platform_copied_to_clipboard"), {
      type: "success",
      autoClose: 1500,
    });
  };

 const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (platforms?.length > 0 && allPlatformsData?.hasNext) {
      setLastId(allPlatformsData?.lastId ?? userPlatforms?.lastId);
    }
  }, [platforms?.length, allPlatformsData?.hasNext, allPlatformsData?.lastId, userPlatforms?.lastId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeSearch = useCallback(
    _debounce((text: string) => {
      if (text.trim().length >= 3 || text.trim().length === 0) {
        setSearchKey(text.trim());
        setLastId(undefined);
        setPage(1);
      }
    }, 500),
    [],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "name",
        headerName: `${text("add_platform_header_name")}`,
        minWidth: 250,
        renderCell: ({ row }) => {
          return (
            <div className="flex w-full justify-between items-center">
              <CustomImage src={row.logo} alt="platform-image" />
              <p className="w-[150px] pl-2 flex-grow truncate">{row.name}</p>
              <Link
                href={`/platform-details?platform=${row.uuid}&platformName=${row.name}&onChainAddress=${row.onChainAddress}&offChainAddress=${row.offChainAddress}&platform_user=${row.platform_user}&url=${row.url}&logo=${row.logo}&createdAt=${row.createdAt}`}
              >
                <Image
                  className="ml-4 mt-0.5 cursor-pointer"
                  width={14}
                  height={14}
                  src="/images/navigate-icon.svg"
                  alt="Navigate Icon"
                />
              </Link>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "url",
        headerName: `${text("add_platform_header_url")}`,
        minWidth: 200,
        renderCell: ({ row }) => {
          return (
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
                  <IconButton onClick={() => copyToClipboard(row.url)} aria-label="copy-icon">
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Image
                        className="cursor-pointer"
                        alt="Copy Icon"
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
          );
        },
      },
      {
        ...sharedColDef,
        field: "platform_user",
        headerName: `${text("add_platform_header_platform_user")}`,
        minWidth: 160,
        hide: !hasAuth("platform"),
        filterable: !!showEmail,
        sortable: !!showEmail,
        renderCell: ({ value }) => (
          <div className="flex w-full justify-between items-center">
            <span className="w-fit truncate text-ellipsis">
              {!showEmail && "invisible" ? "*****@*****" : value}
            </span>
            <IconButton onClick={() => copyToClipboard(value)} aria-label="copy-icon">
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
        field: "offChainAddress",
        headerName: `${text("add_platform_header_off_chain_address")}`,
        width: 180,
        minWidth: 180,
        renderCell: ({ row }) => {
          const addr =
            row?.offChainAddress?.substring(0, 6) +
            "..." +
            row?.offChainAddress?.slice(-6);
          return (
            <div className="flex w-full justify-between">
              <span className="w-[110px] truncate text-ellipsis">{addr}</span>
              <IconButton onClick={() => copyToClipboard(row.offChainAddress)} aria-label="copy-icon">
                <Image
                  className="cursor-pointer"
                  width={17}
                  height={17}
                  src="/images/copy-icon.svg"
                  alt="Copy Icon"
                />
              </IconButton>
            </div>
          );
        },
      },
      {
        ...sharedColDef,
        field: "createdAt",
        headerName: `${text("add_platform_header_created_at")}`,
        type: "date",
        minWidth: 150,
        renderCell: ({ row }) =>
          row.createdAt && (
            <span className="whitespace-normal w-fit ">
              <DateFormatter value={row.createdAt} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "status",
        minWidth: 120,
        headerName: `${text("add_platform_header_status")}`,
        type: "singleSelect",

        valueOptions: [
          { value: 0, label: text("add_platform_status_unapproved") },
          { value: 2, label: text("add_platform_status_approved") },
        ],
        renderCell: ({ row }) => {
          if (row.status == 0) {
            return (
              <div className="bg-red-200 min-w-fit text-red-600 py-1.5 px-3.5 rounded-md font-medium">
                {text("add_platform_status_unapproved")}
              </div>
            );
          } else if (row.status == 2) {
            return (
              <div className="bg-green-200 min-w-fit text-green-600 py-1.5 px-3.5 rounded-md font-medium">
                {text("add_platform_status_approved")}
              </div>
            );
          } else {
            return (
              <div className="bg-slate-200 min-w-fit text-slate-400 py-1.5 px-3.5 rounded-md font-medium">
                {text("add_platform_status_disabled")}
              </div>
            );
          }
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, showEmail, userRole],
  );

  const {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    setOpenConfirmDialog,
  } = useGridColumnChange("platformColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmail]);

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, searchKey]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium" id={htmlIds.text_platforms_header}>
          {text("platforms")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("platforms_detail")}
        </span>
      </div>
      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-2 w-full mb-5">
        <SearchBox onChangeFunc={onChangeSearch} />
        <div className="flex w-full flex-col min-[1040px]:flex-row justify-between items-end gap-2 platform-filters-section">
          <div className="flex">
            {Object.keys(columnCurrentState).length > 0 && (
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            )}
          </div>
          <Box className="flex flex-col min-[490px]:flex-row items-end">
            <div>
              <ShowToolbar
                showToolbar={showToolbar}
                setShowToolbar={setShowToolbar}
              />
              {hasAuth("platform") && (
                <ShowEmail showEmail={showEmail} setShowEmail={setShowEmail} />
              )}
            </div>
            <ButtonAddPlatform setLastId={setLastId} />
          </Box>
        </div>
      </div>
      <div
        id={htmlIds.div_add_platform_page_table_container}
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row?.uuid}
          rows={platforms}
          columns={columns}
          loading={
            isAllPlatformLoading ||
            isAllPlatformFetching ||
            isLoadingUserPlatforms ||
            isFetchingUserPlatforms
          }
          rowCount={platforms.length}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          paginationMode="server"
          apiRef={apiRef}
          onColumnOrderChange={() => handleColumnChange(false)}
          onSortModelChange={() => handleColumnChange(true)}
          components={{
            Toolbar: showToolbar ? CustomToolbar : null,
          }}
          localeText={locale === LocaleEnum.ko_KR  ? {
            ...koKR.components.MuiDataGrid.defaultProps.localeText
          } : {}}
        />
      </div>
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <AdsManagementStatsModal
        ref={viewStatsModal}
        slugOrUrl={statsUrl}
        startAt={createdAt}
      />
    </div>
  );
}
export default PlatformsPage;