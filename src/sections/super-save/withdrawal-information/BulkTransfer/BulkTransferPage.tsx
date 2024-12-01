import { htmlIds } from "@cypress/utils/ids";
import {
    DataGridPro,
    GridColDef,
} from "@mui/x-data-grid-pro";
import {
    Box,
    FormControl,
    IconButton,
    ListItemText,
    MenuItem,
} from "@mui/material";
import SelectField from "@common/components/FormInputs/SelectField";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataFilterType, DateFormatter, Pagination, Spinner } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { arrayToString, resetMUIToolbarFilter } from "@common/utils/helpers";
import Image from "next/image";
import { toast } from "react-toastify";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import FiltersWrapper from "@common/components/DataFilter/FiltersWrapper";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";
import { formatDate, formatDateAndTime, formatNumberWithCommas } from "@common/utils/formatters";
import { useGetBulkTransfer, usePostAdminHistoryLog } from "api/hooks";
import { useRouter } from "next/router";
import { jsonToExcelDownload } from "@common/utils/excelutil";
import { useTimezone } from "@common/hooks";


const sharedColDef: GridColDef = {
    field: "",
    sortable: true,
    flex: 1,
};

const CHANGE_STATUSES = [
    { label: "bulk_transfer_waiting", value: 0 },
    { label: "bulk_transfer_confirmed", value: 1 },
    { label: "bulk_transfer_rejected", value: 2 },
    { label: "bulk_transfer_resent", value: 3 },
];

const MenuProps = {
    PaperProps: {
        style: {
            width: 240,
            borderRadius: 8,
        },
    },
};

function BulkTransferScreen() {
    const { text } = useLocale();
    const { timezone } = useTimezone();
    const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

    const divRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const dataFilter: DataFilterType = router.query;

    const [showToolbar, setShowToolbar] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);


    const { data, isFetching, isLoading } = useGetBulkTransfer(
        {
            limit,
            page,
            searchKey: (dataFilter?.searchKey?.length || 0) > 0
                ? dataFilter?.searchKey
                : undefined,
            from_date: dataFilter?.startDate,
            to_date: dataFilter?.endDate,
            status: dataFilter?.status
        },
    );
    const { isLoading: isMassLoading, isRefetching: isMassRefetching, refetch: massRefetch } = useGetBulkTransfer(
        {
            from_date: dataFilter?.startDate,
            to_date: dataFilter?.endDate,
            status: dataFilter?.status === "all" ? undefined : dataFilter?.status,
            searchKey: dataFilter?.searchKey?.length
                ? dataFilter?.searchKey
                : undefined,
        },
        { enabled: false },
    );

    useEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = 0;
        }
    }, [page]);


    const getStatusTextAndColor = useCallback(
        (value: number) => {
            let statusText = "";
            let color: string | undefined;
            switch (value) {
                case 0:
                    statusText = text("bulk_transfer_waiting");
                    color = "text-blue-400";
                    break;
                case 1:
                    statusText = text("bulk_transfer_confirmed");
                    color = "text-green-400";
                    break;
                case 2:
                    statusText = text("bulk_transfer_rejected");
                    color = "text-red-400";
                    break;
                case 3:
                    statusText = text("bulk_transfer_resent");
                    break;
                default:
                    break;
            }
            return { statusText, color };
        },
        [text],
    );

    const copyToClipboard = (textToCopy: string) => {
        navigator?.clipboard.writeText(textToCopy);
        toast(text("add_platform_copied_to_clipboard"), {
            type: "success",
        });
    };

    const columns: GridColDef[] = useMemo(
        () => [
            {
                ...sharedColDef,
                field: "no",
                headerName: text("bulk_transfer_no_column_title"),
                minWidth: 60,
                disableReorder: true,
                typw: "number",
            },
            {
                ...sharedColDef,
                field: "tx_hash",
                headerName: text("bulk_transfer_transaction_id_column_title"),
                minWidth: 200,
                renderCell: ({ value }) => (
                    <div className="flex w-full items-center justify-between">
                        <span className="w-fit truncate text-ellipsis">{value}</span>
                        <IconButton onClick={() => copyToClipboard(value)}>
                            <Box display="flex" alignItems="center">
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
                field: "status",
                headerName: text("bulk_transfer_status_column_title"),
                minWidth: 150,
                renderCell: ({ value }) => {
                    const { color, statusText } = getStatusTextAndColor(value);
                    return (
                        <p className={`${color}`}>
                            {statusText}
                        </p>
                    );
                },
            },
            {
                ...sharedColDef,
                field: "remark",
                headerName: text("bulk_transfer_remark_column_title"),
                minWidth: 150,
                renderCell: ({ value }) => value || "---"
            },
            {
                ...sharedColDef,
                field: "network",
                headerName: text("bulk_transfer_network_column_title"),
                minWidth: 120,
            },
            {
                ...sharedColDef,
                field: "fee_coin",
                headerName: text("bulk_transfer_fee_coin_column_title"),
                minWidth: 120,
            },
            {
                ...sharedColDef,
                field: "transaction_fee",
                headerName: text("bulk_transfer_transaction_fee_column_title"),
                minWidth: 140,
                renderCell: ({ value }) => formatNumberWithCommas(value, 3),
            },
            {
                ...sharedColDef,
                field: "transfer_coin_symbol",
                headerName: text("bulk_transfer_coin_symbol_column_title"),
                minWidth: 180,
            },
            {
                ...sharedColDef,
                field: "transfer_coin_amount",
                headerName: text("bulk_transfer_coin_amount_column_title"),
                minWidth: 180,
                renderCell: ({ value }) => formatNumberWithCommas(value, 3),
            },
            {
                ...sharedColDef,
                field: "from_wallet",
                headerName: text("bulk_transfer_from_column_title"),
                minWidth: 200,
                renderCell: ({ value }) => (
                    <div className="flex w-full items-center justify-between">
                        <span className="w-fit truncate text-ellipsis">
                            {value || "---"}
                        </span>
                        {value && (
                            <IconButton onClick={() => copyToClipboard(value)}>
                                <Box display="flex" alignItems="center">
                                    <Image
                                        className="cursor-pointer"
                                        alt=""
                                        width={17}
                                        height={17}
                                        src="/images/copy-icon.svg"
                                    />
                                </Box>
                            </IconButton>
                        )}
                    </div>
                ),
            },
            {
                ...sharedColDef,
                field: "to_wallet",
                headerName: text("bulk_transfer_to_column_title"),
                minWidth: 200,
                renderCell: ({ value }) => (
                    <div className="flex w-full items-center justify-between">
                        <span className="w-fit truncate text-ellipsis">
                            {value || "---"}
                        </span>
                        {value && (
                            <IconButton onClick={() => copyToClipboard(value)}>
                                <Box display="flex" alignItems="center">
                                    <Image
                                        className="cursor-pointer"
                                        alt=""
                                        width={17}
                                        height={17}
                                        src="/images/copy-icon.svg"
                                    />
                                </Box>
                            </IconButton>
                        )}
                    </div>
                ),
            },
            {
                ...sharedColDef,
                field: "created_by",
                headerName: text("bulk_transfer_created_by_column_title"),
                minWidth: 200,
                renderCell: ({ value }) => value || "---",
            },
            {
                ...sharedColDef,
                field: "createdAt",
                headerName: text("bulk_transfer_created_date_column_title"),
                minWidth: 170,
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
                headerName: text("bulk_transfer_last_updated_by_column_title"),
                minWidth: 200,
                renderCell: ({ value }) => value || "---",
            },
            {
                ...sharedColDef,
                field: "action_date",
                headerName: text("bulk_transfer_last_updated_date_column_title"),
                minWidth: 170,
                renderCell: ({ value }) =>
                    value ? (
                        <span className="whitespace-normal w-fit ">
                            <DateFormatter value={value} />
                        </span>
                    ) : (
                        "---"
                    ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [text],
    );

    const bulkTransfersWithIndex = useMemo(
        () =>
            data?.bulkTransfers?.map((item, index) => ({
                ...item,
                no: limit * (page - 1) + index + 1,
            })) || [],
        [data?.bulkTransfers, page, limit],
    );

    const handleExcelDownload = async () => {
        const { data: massData } = await massRefetch();
        const bulkTransfers = massData?.bulkTransfers || [];
        jsonToExcelDownload(
            bulkTransfers.map((item, index) => ({
                [text("bulk_transfer_no_column_title")]: index + 1,
                [text("bulk_transfer_transaction_id_column_title")]: item.tx_hash,
                [text("bulk_transfer_status_column_title")]:
                    getStatusTextAndColor(item.status).statusText,
                [text("bulk_transfer_remark_column_title")]: item.remark,
                [text("bulk_transfer_network_column_title")]: item.network,
                [text("bulk_transfer_fee_coin_column_title")]: item.fee_coin,
                [text("bulk_transfer_transaction_fee_column_title")]: item.transaction_fee,
                [text("bulk_transfer_coin_symbol_column_title")]: item.transfer_coin_symbol,
                [text("bulk_transfer_coin_amount_column_title")]: item.transfer_coin_amount,
                [text("bulk_transfer_from_column_title")]: item.from_wallet,
                [text("bulk_transfer_to_column_title")]: item.to_wallet,
                [text("bulk_transfer_created_by_column_title")]: item.created_by,
                [text("bulk_transfer_created_date_column_title")]:
                    item.createdAt && formatDateAndTime(item.createdAt, "YYYY-MM-DD HH:mm:ss", timezone),
                [text("bulk_transfer_last_updated_by_column_title")]: item.action_by,
                [text("bulk_transfer_last_updated_date_column_title")]:
                    item.action_date && formatDateAndTime(item.action_date, "YYYY-MM-DD HH:mm:ss", timezone),
            })),
            `${arrayToString([
                text("bulk_transfer_title"),
                formatDate(new Date(), false),
            ])}`,
        );

        postAdminHistoryLog({
            content_en: "Excel Download",
            content_kr: "Excel Download",
            uuid: arrayToString([
                text("bulk_transfer_title"),
                formatDate(new Date()) + ".xlsx",
            ]),
        });
    };

    const handleDataFilterChange = useCallback(
        (e: DataFilterType) => {
            setPage(1);
            const updatedFilter =
                !e.startDate && !e.endDate
                    ? { startDate: e.startDate, endDate: e.endDate }
                    : undefined;
            router.push({
                pathname: router.pathname,
                query: {
                    ...Object.fromEntries(
                        Object.entries({
                            ...router.query,
                            ...e,
                            ...updatedFilter,
                        }).filter(
                            // eslint-disable-next-line
                            ([_, v]) => v !== undefined && v !== null && v.length !== 0,
                        ),
                    ),
                },
            });
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            router.query.status,
            router.query.searchKey,
        ],
    );

    /* DataGrid Columns Reorder & Sort Handling Start */
    const {
        apiRef,
        handleSaveView,
        openConfirmDialog,
        columnCurrentState,
        handleColumnChange,
        handleResetDefault,
        setOpenConfirmDialog,
    } = useGridColumnChange("bulkTransferColumnState");


    useEffect(() => {
        resetMUIToolbarFilter(apiRef);
    }, [apiRef, dataFilter]);

    return (
        <div ref={divRef} className="flex flex-col h-full px-5 py-5">
            <div className="w-full mb-3 pb-5 platforms-header">
                <h4 className="text-2xl font-medium">
                    {text("bulk_transfer_title")}
                </h4>
                <span className="text-slate-500 text-sm">
                    {text("bulk_transfer_detail")}
                </span>
            </div>

            <div>
                <div className="flex flex-col min-[400px]:flex-row overflow-auto custom_scroll_bar justify-end min-[1400px]:justify-normal min-[1400px]:border-b gap-1 ">
                    <div className="pt-2">
                        <FiltersWrapper handleDataFilterChange={handleDataFilterChange} />
                    </div>
                    <FormControl className="truncate w-full pt-2 min-[400px]:w-60 min-w-60">
                        <SelectField
                            className="truncate bg-gray-50  h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
                            inputProps={{ "aria-label": "Without label" }}
                            label={text("bulk_transfer_status")}
                            MenuProps={MenuProps}
                            value={dataFilter.status || "all"}
                            defaultValue={"all"}
                            onChange={(e) => {
                                handleDataFilterChange({
                                    ...router.query,
                                    ...{ status: e.target.value === "all" ? undefined : e.target.value as string }
                                });
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
                </div>
                <div className="flex  flex-wrap justify-between">
                    <div className="flex items-center">
                        {Object.keys(columnCurrentState).length > 0 && (
                            <SaveNResetButtons
                                saveHandler={() => setOpenConfirmDialog(true)}
                                resetHandler={handleResetDefault}
                            />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1 items-center py-3">
                        <ShowToolbar
                            showToolbar={showToolbar}
                            setShowToolbar={setShowToolbar}
                        />
                        <button
                            id={htmlIds.btn_withdrawal_excel_download}
                            disabled={isMassLoading || isMassRefetching || (data?.bulkTransfers || [])?.length <= 0}
                            onClick={handleExcelDownload}
                            className="flex items-center justify-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
                        >
                            {isMassLoading || isMassRefetching && <Spinner />}{" "}
                            <span>{text("withdrawal_information_excel_download")}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div
                id={htmlIds.div_bulk_transfers_table_container}
                className="w-full bg-white tableContainer"
            >
                <DataGridPro
                    getRowId={(row) => row?.uuid}
                    rows={bulkTransfersWithIndex}
                    columns={columns}
                    loading={isLoading || isFetching}
                    disableSelectionOnClick
                    sx={customisedTableClasses}
                    hideFooter
                    paginationMode="server"
                    rowCount={bulkTransfersWithIndex.length}
                    autoHeight={!isLoading}
                    apiRef={apiRef}
                    onColumnOrderChange={() => handleColumnChange(false)}
                    onSortModelChange={() => handleColumnChange(true)}
                    components={{
                        Toolbar: showToolbar ? CustomToolbar : null,
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
            <ConfirmationDialog
                openConfirmDialog={openConfirmDialog}
                setOpenConfirmDialog={setOpenConfirmDialog}
                onYesHandler={handleSaveView}
            />
        </div>
    );
}

export default BulkTransferScreen;