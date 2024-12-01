import { useState, useMemo, useCallback, useEffect } from "react";
import { useGetCommunityList, useDeleteCommunities } from "api/hooks/community";
import { Box, Breadcrumbs, Divider, Typography } from "@mui/material";
import { DataGridPro, GridEventListener, GridRowId } from "@mui/x-data-grid-pro";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { toast } from "react-toastify";
import {
  FormComponent,
  HeaderComponent,
  DeleteDialogComponent,
  useCommunityCols,
} from "./Components";
import {
  IGetCommDeleteErr,
  IGetCommDeleteRes,
  CommunityObject,
  IPostCommunityForm,
  IGetCommRes,
  IGetCommunityFormError,
} from "api/hooks/community/types";
import CustomDialog from "@common/components/CustomDialog";
import Link from "next/link";
import { MuiLink } from "@common/components/MuiLink";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { DateValueType } from "react-tailwindcss-datepicker";
import { scrollToTop } from "@common/utils/helpers";

export interface EditData extends IPostCommunityForm {
  uuid: string;
}

const CommunityScreen = () => {
  const { text } = useLocale();
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);
  const [communityData, setCommunityData] = useState<CommunityObject[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [deleteData, setDeleteData] = useState<Array<GridRowId>>([]);
  const [lastId, setLastId] = useState<string | undefined>("");
  const [dates, setDates] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const { data, isFetching, refetch } = useGetCommunityList(
    {
      limit: 25,
      lastId,
      searchKey,
      ...(dates?.startDate && { date_from: new Date(dates?.startDate)?.toISOString().split("T")[0] }),
      ...(dates?.endDate && { date_to: new Date(dates?.endDate)?.toISOString().split("T")[0] }),
    },
    {
      onSuccess: (data: IGetCommRes) => {
      if (lastId !== undefined) {
        setCommunityData((prev) => [...prev, ...data.communityListData]);
      } else {
        setCommunityData(data.communityListData);
      }
      },
    },
  );

  const { mutateAsync: deleteCommunity, isLoading } = useDeleteCommunities({
    onSuccess: (response: IGetCommDeleteRes) => {
      handleCloseDelete();
      setLastId(undefined);
      scrollToTop();
      toast.success(response.data.message);
      lastId === undefined && refetch();
    },
    onError: (error: IGetCommDeleteErr) => {
      toast.error(error.response?.data.err);
    },
  });

  const handleDelete = () => {
    deleteCommunity({
      id_list: deleteData,
    }).catch((error: IGetCommunityFormError) => {
      toast.error(error.response?.data.result);
      handleCloseDelete();
    });
  };

  const handleUpdateCommunity = (community: CommunityObject) => {
    const {
      uuid,
      name,
      country,
      representative,
      email,
      phone_number,
      referral_code,
      guide_info,
      location,
    } = community;

    setEditData({
      name,
      country,
      representative,
      email,
      phone_number,
      referral_code,
      uuid,
      guide_info,
      location,
    });

    setOpen(true);
  };

  const handleDeleteCommunity = (community: CommunityObject) => {
    setDeleteData([community.uuid]);
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);

    if (editData) {
      setEditData(null);
    }
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteData([]);
  };

  const { CommunityColumns } = useCommunityCols({
    handleUpdateCommunity,
    handleDeleteCommunity,
    deleteData: deleteData.length,
  });

  const handleSelectionModelChange = (newSelection: Array<GridRowId>) => {
    setDeleteData(newSelection);
  };


   const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (communityData?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [communityData?.length, data?.hasNext, data?.lastId]);

  const communityDataWithNo = useMemo(() => {
    return communityData.map((data, index) => ({
      ...data,
      no: index + 1,
    }));
  }, [communityData]);

  const dialogTitle = useMemo(
    () =>
      editData
        ? text("community_edit_form_title")
        : text("community_add_form_title"),
    [editData],
  );

  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    setOpenConfirmDialog,
    columnCurrentState,
  } = useGridColumnChange("CommunityScreenColumnState");
  
  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <>
      <Box
        sx={{
          height: "100%",
          py: 2,
          px: 2,
          display: "flex",
          flexDirection: "column",
          rowGap: 3,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" className="w-full">
          <Link
            href="/users"
            className="text-xs text-inherit hover:underline"
            passHref
          >
            {text("users_detail_link_users")}
          </Link>
          <MuiLink
            underline="hover"
            className="text-blue-500 text-xs"
            aria-current="page"
          >
            {text("community_title")}
          </MuiLink>
        </Breadcrumbs>
        <HeaderComponent
          setSearchKey={setSearchKey}
          onAdd={() => setOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          setLastId={setLastId}
          deleteData={deleteData}
          dates={dates}
          setDates={setDates}
        />

        <Divider />
        <div className="flex justify-between gap-2 flex-wrap">
          <div className="flex items-center">
            {Object.keys(columnCurrentState).length > 0 && (
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            )}
          </div>
        </div>

        <Box
          sx={{ width: "100%", height: "100%" }}>
          <DataGridPro
            onRowsScrollEnd={handleScrollEnd}
            columns={CommunityColumns}
            rows={communityDataWithNo}
            getRowId={(row: CommunityObject) => row.uuid}
            loading={isFetching}
            sx={customisedTableClasses}
            checkboxSelection={true}
            disableSelectionOnClick={true}
            hideFooter
            pinnedColumns={{
              right: ["actions"],
            }}
            onSelectionModelChange={(newSelectionModel: Array<GridRowId>) => {
              handleSelectionModelChange(newSelectionModel);
            }}
            selectionModel={deleteData}
            apiRef={apiRef}
            onColumnOrderChange={() => handleColumnChange(false)}
            onSortModelChange={() => handleColumnChange(true)}
          />
        </Box>
      </Box>
      
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
      <CustomDialog
        open={open}
        onClose={handleCloseForm}
        titleText={dialogTitle}
      >
        <FormComponent
          onCloseForm={handleCloseForm}
          refetch={refetch}
          lastId={lastId}
          setLastId={setLastId}
          editData={editData}
        />
      </CustomDialog>

      <DeleteDialogComponent
        open={deleteOpen}
        onClose={handleCloseDelete}
        handleDelete={handleDelete}
        isLoading={isLoading}
        deleteData={deleteData.length}
      />
    </>
  );
};

export default CommunityScreen;
