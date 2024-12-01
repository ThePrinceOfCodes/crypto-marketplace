import { formatNumberWithCommas } from "@common/utils/formatters";
import React, { useMemo, useState, useRef, ReactNode, useEffect, useCallback } from "react";
import Image from "next/image";
import { DataGridPro, GridColDef, GridEventListener, GridSelectionModel, } from "@mui/x-data-grid-pro";
import { toast } from "react-toastify";
import { DataFilterType, DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useDialog } from "@common/context";
import styles from "./style.module.css";
import { useGetFlataExchange, useGetSuperSaveAmount, useSetMsqStandardAmount, useGetMsqStandardAmountHistory, IMsqStandardAmountHistory, iPostSetMsqStandardAmountRsq, } from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { resetMUIToolbarFilter } from "@common/utils/helpers";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import useResponsive from "@common/hooks/useResponsive";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

type StandardAmountType = {
  value: string;
  id: number;
  title?: string;
  icon: string;
  amount: ReactNode | null;
};

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
};

const MSQStandardAmountPage = () => {
  const { text } = useLocale();
  const { isBigScreen } = useResponsive();
  const { confirmDialog, alertDialog } = useDialog();
  const [selectedStandardAmount, setSelectedStandardAmount] = useState<
    string | undefined
  >();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridSelectionModel>([]);

  const [lastId, setLastId] = useState<string>();
  const [msqRateList, setMsqRateList] = useState<IMsqStandardAmountHistory[]>(
    [],
  );
  const [dataFilter, setDataFilter] = useState<DataFilterType>();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  const { data: flataExchange } = useGetFlataExchange();
  const { data: superSaveAmount } = useGetSuperSaveAmount();
  const { mutateAsync: setMsqStandardAmount } = useSetMsqStandardAmount();

  const { data, isFetching, refetch } = useGetMsqStandardAmountHistory(
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
        setMsqRateList((prev) => [
          ...(lastId !== undefined ? prev : []),
          ...res.allMsqRateList,
        ]);
        if (res?.allMsqRateList?.length) {
          setSelectedStandardAmount(res?.allMsqRateList[0].name);
        }
      },
    },
  );

  const StandardAmountList: (StandardAmountType &
    iPostSetMsqStandardAmountRsq)[] = [
      {
        id: 4,
        value: "Super Save",
        title: "msq_standard_amount_super_save",
        icon: "/images/super-save-logo.svg",
        amount:
          superSaveAmount?.super_save_amount ||
            superSaveAmount?.msqx_super_save_amount ||
            superSaveAmount?.sut_super_save_amount ? (
            <div className={"flex flex-col"}>
              <div>
                MSQ:{" "}
                {superSaveAmount?.super_save_amount
                  ? formatNumberWithCommas(superSaveAmount?.super_save_amount) +
                  text("msq_standard_amount_krw")
                  : text("msq_standard_amount_not_available")}
              </div>
              <div>
                MSQX:{" "}
                {superSaveAmount?.msqx_super_save_amount
                  ? formatNumberWithCommas(
                    superSaveAmount?.msqx_super_save_amount,
                  ) + text("msq_standard_amount_krw")
                  : text("msq_standard_amount_not_available")}
              </div>
              <div>
                SUT:{" "}
                {superSaveAmount?.sut_super_save_amount
                  ? formatNumberWithCommas(
                    superSaveAmount?.sut_super_save_amount,
                  ) + text("msq_standard_amount_krw")
                  : text("msq_standard_amount_not_available")}
              </div>
            </div>
          ) : null,
        name: "Super Save",
        rate: superSaveAmount?.super_save_amount,
        msqx_rate: superSaveAmount?.msqx_super_save_amount,
        sut_rate: superSaveAmount?.sut_super_save_amount,
      },
      {
        id: 1,
        value: "Bithumb",
        title: "msq_standard_amount_bithumb",
        icon: "/images/bithumb-logo.svg",
        amount: null,
        name: "Bithumb",
        rate: 0,
        msqx_rate: 0,
        sut_rate: 0,
      },
      {
        id: 2,
        value: "Upbit",
        title: "msq_standard_amount_upbit",
        icon: "/images/upbit-logo.svg",
        amount: null,
        name: "Upbit",
        rate: 0,
        msqx_rate: 0,
        sut_rate: 0,
      },
      {
        id: 3,
        value: "Flata Exchange",
        title: "msq_standard_amount_flata_exchange",
        icon: "/images/flata-exchange-logo.png",
        amount:
          flataExchange?.rate || flataExchange?.msqx_rate ? (
            <div className={"flex flex-col"}>
              <div>
                MSQ:{" "}
                {flataExchange?.rate
                  ? formatNumberWithCommas(flataExchange?.rate) +
                  text("msq_standard_amount_krw")
                  : text("msq_standard_amount_not_available")}
              </div>
              <div>
                MSQX:{" "}
                {flataExchange?.msqx_rate
                  ? formatNumberWithCommas(flataExchange?.msqx_rate) +
                  text("msq_standard_amount_krw")
                  : text("msq_standard_amount_not_available")}
              </div>
              <div>SUT: {text("msq_standard_amount_not_available")}</div>
            </div>
          ) : null,
        name: "Flata Exchange",
        rate: flataExchange?.rate,
        msqx_rate: flataExchange?.msqx_rate,
        sut_rate: 0,
      },
    ];

  const columns: GridColDef[] = useMemo(
    () => [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("msq_standard_amount_column_header_no"),
        minWidth: 80,
        disableReorder: true,
        type: "number",
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("msq_standard_amount_column_header_exchange_standard"),
        flex: 1,
        minWidth: 230,
      },
      {
        ...sharedColDef,
        field: "msq_standard_amount",
        headerName: text("msq_standard_amount_column_header_amount"),
        flex: 1,
        minWidth: 200,
        type: "number",
        width: 150,
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)}{" "}
            {value ? text("deposit_information_krw_suffix") : null}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "msqx_standard_amount",
        headerName: text("msq_standard_amount_column_header_msqx_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)}{" "}
            {value ? text("deposit_information_krw_suffix") : null}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "sut_standard_amount",
        headerName: text("msq_standard_amount_column_header_sut_amount"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "number",
        renderCell: ({ value }) => (
          <div>
            {formatNumberWithCommas(value)}{" "}
            {value ? text("deposit_information_krw_suffix") : null}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "is_applied",
        headerName: text("msq_standard_amount_column_status"),
        flex: 1,
        minWidth: 200,
        width: 150,
        type: "boolean",
        renderCell: ({ value }) => (
          <div className="flex w-full">
            {value
              ? text("msq_standard_amount_column_status_apply")
              : text("msq_standard_amount_column_status_not_applicable")}
          </div>
        ),
      },
      {
        ...sharedColDef,
        field: "timestamp",
        headerName: text("msq_standard_amount_column_application_date"),
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
        headerName: text("msq_standard_amount_column_manager"),
        flex: 1,
        minWidth: 200,
        width: 150,
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const handleSelectedAmount = () => {
    if (data?.allMsqRateList?.length)
      setSelectedStandardAmount(data?.allMsqRateList[0].name);
    else setSelectedStandardAmount(undefined);
  };

  const handleSetMsqStandardAmount = async (
    standardAmount: StandardAmountType & iPostSetMsqStandardAmountRsq,
  ) => {
    if (standardAmount && standardAmount?.amount) {
      const { value, rate, msqx_rate, sut_rate } = standardAmount;

      if (!sut_rate && !msqx_rate && !rate) return;

      setMsqStandardAmount({
        name: value,
        sut_rate: Math.floor(sut_rate || 0),
        msqx_rate: Math.floor(msqx_rate || 0),
        rate: Math.floor(rate || 0),
      })
        .then((res) => {
          toast(res.data.result, {
            type: "success",
          });
        })
        .catch((err) => {
          toast(
            err?.response?.data.message || text("msq_standard_amount_error"),
            {
              type: "error",
            },
          );
          handleSelectedAmount();
        });
    }
  };

  const handleSave = (
    standardAmount: StandardAmountType & iPostSetMsqStandardAmountRsq,
  ) => {
    confirmDialog({
      title: text("msq_standard_amount_update_confirmation"),
      content: text("msq_standard_amount_update_confirmation_content"),
      cancelButtonText: text("msq_standard_amount_update_cancel_text"),
      okButtonText: text("msq_standard_amount_update_save_title"),
      onOk: () =>
        handleSetMsqStandardAmount(standardAmount).then(() => {
          alertDialog({
            title: text("msq_standard_amount_update_saved"),
            onOk: async () => {
              refetch().then((res) => {
                setMsqRateList(res.data?.allMsqRateList || []);
                // scroll to top of data grid
                document
                  ?.querySelector?.(".MuiDataGrid-virtualScroller")
                  ?.scrollTo?.({ top: 0 });
              });
            },
          });
        }),
      onCancel: () => handleSelectedAmount(),
    });
  };

   const handleScrollEnd: GridEventListener<"rowsScrollEnd"> = useCallback(() => {
     if (msqRateList?.length > 0 && data?.hasNext) {
      setLastId(data?.lastId);
    }
  }, [msqRateList?.length, data?.hasNext, data?.lastId]);

  const handleDataFilterChange = React.useCallback((e: DataFilterType) => {
    setDataFilter(e);
    setLastId(undefined);
  }, []);

  const historyWithIndex = useMemo(
    () =>
      msqRateList.map((item, index) => ({
        no: index + 1,
        ...item,
      })),
    [msqRateList],
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
  } = useGridColumnChange("msqStandardAmountColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  useEffect(() => {
    resetMUIToolbarFilter(apiRef);
  }, [apiRef, dataFilter]);

  return (
    <div className="flex flex-col px-5 py-5">
      <div className="w-full pb-5 tokens-header">
        <h4 className="text-2xl font-medium">
          {text("msq_standard_amount_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("msq_standard_amount_detail")}
        </span>
      </div>
      <div className='flex md:flex-row overflow-x-auto gap-3 h-full py-2 w-full md:w-auto mb-1'>
        {StandardAmountList.map(
          (
            { icon, amount, id, value, title, rate, msqx_rate, sut_rate },
            index,
          ) => {
            // if (amount) amount = Math.floor(amount);
            return (
              <div
                onClick={() => {
                  if (!amount) return;
                  setSelectedStandardAmount(value);
                  handleSave({
                    value,
                    icon,
                    amount,
                    id,
                    rate,
                    msqx_rate,
                    sut_rate,
                    name: value,
                  });
                }}
                key={index}
                className={`${amount && "cursor-pointer"} ${styles["card-body"]
                  } flex flex-grow flex-row md:flex-col items-center justify-around p-4 sm:mb-[10px] bg-slate-50 rounded-md mt-3 border border-inherit min-w-[300px] xl:w-[300px] h-[150px]`}
              >
                <div className="h-[100px] md:h-[30%] w-[10%] md:w-full flex flex-col md:flex-row justify-between items-center">
                  <div className="flex">
                    <Image
                      width={30}
                      height={30}
                      src={icon}
                      alt={`${value} Icon`}
                    />
                    <div className="h-[18%] w-[20%] md:w-full py-2 font-bold text-sm md:text-base ml-3">
                      {" "}
                      <span>{text(title as LocalKeys)}</span>{" "}
                    </div>
                  </div>

                  <Image
                    id={htmlIds.btn_msq_standard_amount_super_save}
                    className={`${selectedStandardAmount?.toLowerCase() !==
                      value?.toLowerCase() && "grayscale"
                      } object-contain`}
                    width={25}
                    height={25}
                    src={"/images/tick.png"}
                    alt={`${value} Icon`}
                  />
                </div>

                <div className="h-[48%] w-[44%] md:w-full py-1 text-sm xl:text-base flex justify-center">
                  <span>
                    {amount
                      ? amount
                      : text("msq_standard_amount_not_available")}
                  </span>
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className={`${!isBigScreen ? "mb-3 pb-3" : ""} border-b border-t pt-3`}>
        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
      </div>
      <div className="flex justify-between">
        <div>
          {Object.keys(columnCurrentState).length > 0 && (
            <div className="flex py-3">
              <SaveNResetButtons
                saveHandler={() => setOpenConfirmDialog(true)}
                resetHandler={handleResetDefault}
              />
            </div>
          )}
        </div>
        <ShowToolbar
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
      </div>
      <div
        className="w-full bg-white flex-grow h-[70vh]"
      // className="w-full bg-white pb-5 h-[65vh] md:h-auto md:pb-0 md:flex-grow"
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
      <ConfirmationDialog
        openConfirmDialog={openConfirmDialog}
        setOpenConfirmDialog={setOpenConfirmDialog}
        onYesHandler={handleSaveView}
      />
    </div>
  );
};
export default MSQStandardAmountPage;
