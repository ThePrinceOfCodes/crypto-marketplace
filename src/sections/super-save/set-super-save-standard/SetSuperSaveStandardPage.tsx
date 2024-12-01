/* eslint-disable react-hooks/exhaustive-deps */
import { formatNumberWithCommas } from "@common/utils/formatters";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel
} from "@mui/x-data-grid-pro";
import { StandardAmountModal } from "./components";
import { DataFilterType, DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import {
  ISuperSaveAmountHistory,
  useGetSuperSaveAmountHistory,
} from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import {
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import { queryClient } from "api";
import { StandardRatioAmountModal } from "./components/StandardRatioAmountModal";
import { StandardDiscountAmountModal } from "./components/StandardDiscountAmountModal";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import useResponsive from "@common/hooks/useResponsive";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

const SetSuperSaveStandardPage = () => {
  const { text } = useLocale();
  const { isBigScreen,isTablet} = useResponsive();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [ratioModalOpen, setRatioModalOpen] = React.useState<boolean>(false);
  const [discountModalOpen, setDiscountModalOpen] =
    React.useState<boolean>(false);
  const [lastId, setLastId] = useState<string>();
  const [allSuperSaveRateList, setAllSuperSaveRateList] = useState<
    ISuperSaveAmountHistory[]
  >([]);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const handleModalClose = React.useCallback(() => {
    setModalOpen(false);
  }, []);
  const handleRatioModalClose = React.useCallback(() => {
    setRatioModalOpen(false);
  }, []);

  const handleDiscountModalClose = React.useCallback(() => {
    setDiscountModalOpen(false);
  }, []);

  const handleModalSubmit = () => {
    if (lastId !== undefined) {
      setLastId(undefined);
    } else {
      queryClient.invalidateQueries("get-super-save-amount-history");
    }
    document
      ?.querySelector?.(".MuiDataGrid-virtualScroller")
      ?.scrollTo?.({ top: 0 });
  };

  const { data, isFetching } = useGetSuperSaveAmountHistory(
    {
      limit: 25,
      lastId,
      search:
        (dataFilter?.searchKey?.length || 0) > 0
          ? dataFilter?.searchKey
          : undefined,
      from_date: dataFilter?.startDate,
      to_date: dataFilter?.endDate,
    },
    {
      onSuccess: (res) => {
        setAllSuperSaveRateList((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...res.allSuperSaveRateList,
        ]);
      },
    },
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("super_save_amount_header_no"),
        minWidth: 80,
        type: "number",
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "super_save_amount",
        headerName: text("super_save_amount_header_msq_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "super_save_discount",
        headerName: text("super_save_amount_header_msq_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "super_trust_amount",
        headerName: text("super_save_amount_header_st_msq_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "super_trust_discount",
        headerName: text("super_save_amount_header_st_msq_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "msqx_super_save_amount",
        headerName: text("super_save_amount_header_msqx_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "msqx_super_save_discount",
        headerName: text("super_save_amount_header_msqx_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "msqx_super_trust_amount",
        headerName: text("super_save_amount_header_st_msqx_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "msqx_super_trust_discount",
        headerName: text("super_save_amount_header_st_msqx_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "sut_super_save_amount",
        headerName: text("super_save_amount_header_sut_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "sut_super_save_discount",
        headerName: text("super_save_amount_header_sut_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "sut_super_trust_amount",
        headerName: text("super_save_amount_header_st_sut_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "sut_super_trust_discount",
        headerName: text("super_save_amount_header_st_sut_discount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "p2u_super_trust_amount",
        headerName: text("super_save_amount_header_st_p2u_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "credit_sale_amount",
        headerName: text("super_save_amount_header_msq_credit_sale_price"),
        flex: 1,
        minWidth: 200,
        width: 200,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "credit_sale_discount",
        headerName: text("super_save_amount_header_msq_credit_sale_discount"),
        flex: 1,
        minWidth: 200,
        width: 200,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "msqx_credit_sale_amount",
        headerName: text("super_save_amount_header_msqx_credit_sale_price"),
        flex: 1,
        minWidth: 200,
        width: 200,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "msqx_credit_sale_discount",
        headerName: text("super_save_amount_header_msqx_credit_sale_discount"),
        flex: 1,
        minWidth: 200,
        width: 200,
        type: "number",
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "sut_credit_sale_amount",
        headerName: text("super_save_amount_header_sut_credit_sale_price"),
        flex: 1,
        minWidth: 200,
        width: 200,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value
              ? `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`
              : "---"}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "sut_credit_sale_discount",
        headerName: text("super_save_amount_header_sut_credit_sale_discount"),
        flex: 1,
        minWidth: 200,
        width: 200,
        renderCell: ({ value }) => <div>{value ? `${value}%` : "---"}</div>,
      },
      {
        ...sharedColDef,
        field: "is_applied",
        headerName: text("super_save_amount_header_status"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "boolean",
        renderCell: ({ value }) => (
          <div className="flex w-full">
            {value
              ? text("super_save_amount_header_apply")
              : text("super_save_amount_header_not_applicable")}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "timestamp",
        headerName: text("super_save_amount_header_application_date"),
        flex: 1,
        minWidth: 150,
        type: "date",
        renderCell: ({ value }) =>
          value && (
            <span className="whitespace-normal w-fit">
              <DateFormatter value={value} />
            </span>
          ),
      },
      {
        ...sharedColDef,
        field: "action_by",
        headerName: text("super_save_amount_header_manager"),
        flex: 1,
        minWidth: 200,
        width: 150,
      },
    ],
    [text],
  );

   const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (allSuperSaveRateList?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [allSuperSaveRateList?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = React.useCallback((e: DataFilterType) => {
    setDataFilter(e);
    setLastId(undefined);
  }, []);

  const handleSetRatioPercentage = () => {
    setRatioModalOpen(true);
  };

  const historyWithIndex = useMemo(
    () =>
      allSuperSaveRateList.map((item, index) => ({
        ...item,
        no: index + 1,
      })),
    [allSuperSaveRateList],
  );

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
  } = useGridColumnChange("supersaveStandardColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="md:flex md:flex-col h-full px-5 py-5">
      <div className="w-full mb-1 xl:mb-5 pb-5 tokens-header">
        <h4 className="text-2xl font-medium">
          {text("super_save_amount_setting_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("super_save_amount_setting_detail")}
        </span>
      </div>

      <div className={`${!isBigScreen ? "mb-3" : ""}`}>
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
      </div>

      <div className="flex flex-wrap flex-col-reverse xl:flex-row xl:items-center justify-between">
        <div className="flex pb-3 gap-2">
          {Object.keys(columnCurrentState).length > 0 && (
            <div>
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col xl:flex-row justify-between items-end gap-2 my-4">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          <div className="flex flex-col gap-2 md:flex-row">
          <button
            id={htmlIds.btn_set_standard_amount}
            className={`flex items-center ${isTablet ? "text-xs px-2" : "text-sm px-4"} h-10 bg-blue-500 text-white rounded-md`}
            onClick={() => setModalOpen(true)}
          >
            <span>{text("super_save_amount_set_standard")}</span>
          </button>
          <button
            id={htmlIds.btn_set_percent_of_msq_and_p2u}
            className={`flex items-center ${isTablet ? "text-xs px-2" : "text-sm px-4"} h-10 bg-blue-500 text-white rounded-md`}
            onClick={() => handleSetRatioPercentage()}
          >
            <span>
              {text("super_save_amount_set_percent_of_msq_msqx_sut_and_p2u")}
            </span>
          </button>
          <button
            id={htmlIds.btn_set_percent_of_msq_and_msqx_discount}
            className={`flex items-center ${isTablet ? "text-xs px-2" : "text-sm px-4"} h-10 bg-blue-500 text-white rounded-md`}
            onClick={() => setDiscountModalOpen(true)}
          >
            <span>
              {text("super_save_amount_set_percent_of_msq_and_msqx_discount")}
            </span>
          </button>
          </div>
        </div>
      </div>

      <div
        className="w-full bg-white h-[65vh] pb-4 md:pb-0 md:flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row.id}
          rows={historyWithIndex}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
          rowCount={historyWithIndex.length}
          paginationMode="server"
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
      <StandardAmountModal
        open={modalOpen}
        handleSubmit={handleModalSubmit}
        handleClose={handleModalClose}
      />
      <StandardRatioAmountModal
        open={ratioModalOpen}
        handleSubmit={handleModalSubmit}
        handleClose={handleRatioModalClose}
      />
      <StandardDiscountAmountModal
        open={discountModalOpen}
        handleSubmit={handleModalSubmit}
        handleClose={handleDiscountModalClose}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
};
export default SetSuperSaveStandardPage;
