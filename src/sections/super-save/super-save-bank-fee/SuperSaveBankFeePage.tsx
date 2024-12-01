/* eslint-disable react-hooks/exhaustive-deps */
import { formatNumberWithCommas } from "@common/utils/formatters";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DataGridPro,
  GridColDef,
  GridEventListener,
  GridSelectionModel,
} from "@mui/x-data-grid-pro";
import { BankFeeModal } from "./components";
import { DataFilterType, DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import {
  ISuperSaveBankFeeHistory,
  useGetSuperSaveBankFeeHistory,
} from "api/hooks";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import {
  resetMUIToolbarFilter,
} from "@common/utils/helpers";
import { queryClient } from "api";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

const SuperSaveBankFeePage = () => {
  const { text } = useLocale();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [lastId, setLastId] = useState<string>();
  const [allSuperSaveBankFeeList, setAllSuperSaveBankFeeList] = useState<
    ISuperSaveBankFeeHistory[]
  >([]);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const handleModalClose = React.useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalSubmit = () => {
    if (lastId !== undefined) {
      setLastId(undefined);
    } else {
      queryClient.invalidateQueries("get-super-save-bank-fee-history");
    }
    document
      ?.querySelector?.(".MuiDataGrid-virtualScroller")
      ?.scrollTo?.({ top: 0 });
  };

  const { data, isFetching } = useGetSuperSaveBankFeeHistory(
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
        setAllSuperSaveBankFeeList((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...res.allSuperSaveBankFeeList,
        ]);
      },
    },
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("super_save_bank_fee_header_column_no"),
        minWidth: 80,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "bank_fee",
        headerName: text("super_save_bank_fee_header_column_bank_fee"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {value &&
              `${formatNumberWithCommas(value)} ${text(
                "deposit_information_krw_suffix",
              )}`}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "usdt_charge",
        headerName: text("super_save_bank_fee_header_column_usdt_charge"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>{value && `${formatNumberWithCommas(value, 3)} USDT`}</div>
        ),
      },
      {
        ...sharedColDef,
        field: "is_applied",
        headerName: text("super_save_bank_fee_header_column_status"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "boolean",
        renderCell: ({ value }) => (
          <div className="flex w-full">
            {value
              ? text("super_save_bank_fee_status_apply")
              : text("super_save_bank_fee_status_not_applicable")}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "timestamp",
        headerName: text("super_save_bank_fee_status_application_date"),
        flex: 1,
        minWidth: 200,
        width: 150,
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
        field: "action_by",
        headerName: text("super_save_bank_fee_status_manager"),
        flex: 1,
        minWidth: 200,
        width: 150,
      },
    ],
    [text],
  );

  const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (allSuperSaveBankFeeList?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [allSuperSaveBankFeeList?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = React.useCallback((e: DataFilterType) => {
    setDataFilter(e);
    setLastId(undefined);
  }, []);

  const historyWithIndex = useMemo(
    () =>
      allSuperSaveBankFeeList.map((item, index) => ({
        ...item,
        no: index + 1,
      })),
    [allSuperSaveBankFeeList],
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
  } = useGridColumnChange("supersaveBankFeeColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="w-full pb-5 tokens-header">
        <h4 className="text-2xl font-medium">
          {text("super_save_bank_fee_setting")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("super_save_bank_fee_setting_detail")}
        </span>
      </div>

      <div className="mt-3">
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center my-5 justify-between">
        <div className="flex justify-self-start gap-2">
          {" "}
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
            id={htmlIds.btn_super_save_bank_modal_open}
            className="flex justify-self-start self-start items-center flex-grow-0 text-sm px-4 h-10  bg-blue-500 text-white rounded-md"
            onClick={() => setModalOpen(true)}
          >
            <span>{text("super_save_set_bank_fee")}</span>
          </button>
        </div>
      </div>

      <div
        className="w-full bg-white flex-grow"
      >
        <DataGridPro
          onRowsScrollEnd={handleScrollEnd}
          getRowId={(row) => row.id}
          rows={historyWithIndex}
          rowCount={historyWithIndex.length}
          columns={columns}
          loading={isFetching}
          disableSelectionOnClick
          sx={customisedTableClasses}
          hideFooter
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
      <BankFeeModal
        open={modalOpen}
        handleSubmit={handleModalSubmit}
        handleClose={handleModalClose}
      />
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
};
export default SuperSaveBankFeePage;
