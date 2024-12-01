import {
  Fragment,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { GridApiRefType } from "../CheckIntroducerInfoGridPhoneInput/types";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import {
  GridRowModesModel,
  GridRowModes,
  GridColumns,
  GridRowParams,
  MuiEvent,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  DataGridPro,
  GridColDef,
  GridValidRowModel,
  GridRenderEditCellParams,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import { useLocale } from "locale";
import {
  ICheckIntroducerInfoGridProps,
  ICheckIntroducerInfoGridRef,
} from "./types";
import { toast } from "react-toastify";
import Image from "next/image";
import { useCopyToClipboard } from "@common/utils/helpers";
import {
  IDepositRequest,
  useCheckUserReferralCodeByAdmin,
  useSearchSuperSaveRequestByPhoneNumber,
} from "api/hooks";
import { Alert, Box, CircularProgress } from "@mui/material";
import debounce from "lodash/debounce";
import Link from "next/link";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import PhoneNumberEditCellInput from "../CheckIntroducerInfoGridPhoneInput/CheckIntroducerInfoGridPhoneInput";
import ReferralCodeEditCellInput from "../CheckIntroducerInfoGridReferralCodeInput/CheckIntroducerInfoGridReferralCodeInput";
import PercentageEditCellInput from "../CheckIntroducerInfoGridPercentageInput/CheckIntroducerInfoGridPercentageInput";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true,
  headerAlign: "center",
  align: "center",
};

const CheckIntroducerInfoGrid = forwardRef(
  (
    props: ICheckIntroducerInfoGridProps,
    ref: Ref<ICheckIntroducerInfoGridRef>,
  ) => {
    const {
      rows: propsRows,
      onUpdateIntroducers,
      onEditModeChange,
      introducerCreditInfo,
    } = props;
    const [rows, setRows] = useState(propsRows);
    const [editMode, setEditMode] = useState(false);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [showToolbar, setShowToolbar] = useState<boolean>(false);

    const copyToClipboard = useCopyToClipboard();
    const gridRef = useGridApiRef();

    const { mutateAsync: searchUserByPhoneNumber } =
      useSearchSuperSaveRequestByPhoneNumber();

    const { mutateAsync: checkUserReferralCodeByAdmin } =
      useCheckUserReferralCodeByAdmin();

    useEffect(() => {
      if (onEditModeChange) {
        onEditModeChange(editMode);
      }
    }, [editMode, onEditModeChange]);

    const handleCheckMissingReferralCode = () => {
      rows.forEach((row) => {
        if (!row.referral_code) {
          gridRef.current?.updateRows([{ id: row.id, isLoading: true }]);
          searchUserByPhoneNumber(
            {
              phoneNumber: row.phone,
            },
            {
              onSuccess: (data) => {
                if (data) {
                  gridRef?.current?.setEditCellValue({
                    id: row.id,
                    field: "referral_code",
                    value: data?.code,
                  });
                  gridRef?.current?.setEditCellValue({
                    id: row.id,
                    field: "name",
                    value: data?.name,
                  });
                  gridRef.current?.updateRows([
                    { id: row.id, isLoading: false },
                  ]);
                }
              },
            },
          ).catch(() => {
            gridRef.current?.updateRows([{ id: row.id, isLoading: false }]);
          });
        }
      });
    };

    const handleEditAllClick = useCallback(() => {
      const newModel: GridRowModesModel = {};
      rows.forEach((row) => {
        newModel[row.id] = { mode: GridRowModes.Edit };
        gridRef.current?.updateRows([
          { id: row.id, isPhoneDisabled: false, isReferralCodeDisabled: false },
        ]);
      });
      setEditMode(true);
      setRowModesModel(newModel);
    }, [gridRef, rows]);

    const handleCancelAllClick = useCallback(() => {
      const newModel: GridRowModesModel = {};
      rows.forEach((row) => {
        newModel[row.id] = {
          mode: GridRowModes.View,
          ignoreModifications: true,
        };
      });
      propsRows.forEach((row) => {
        newModel[row.id] = {
          mode: GridRowModes.View,
          ignoreModifications: true,
        };
      });
      setEditMode(false);
      setRowModesModel(newModel);
      setRows(propsRows);
    }, [propsRows, rows]);

    const processRowUpdate = useCallback(
      (newRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };

        setRows((oldRows) => {
          const updatedNewRows = oldRows.map((row) =>
            row.id === newRow.id ? updatedRow : row,
          );

          if (onUpdateIntroducers) {
            onUpdateIntroducers(updatedNewRows as GridValidRowModel[]);
          }
          return updatedNewRows;
        });

        return updatedRow;
      },
      [onUpdateIntroducers],
    );

    const handleSaveAllClick = useCallback(() => {
      const newModel: GridRowModesModel = {};
      rows.forEach((row) => {
        newModel[row.id] = { mode: GridRowModes.View };
      });
      setRowModesModel(newModel);
      setEditMode(false);
      if (rows.length === 0) {
        processRowUpdate({});
      }
    }, [processRowUpdate, rows]);

    const handleOnDeleteEmptyRowCB = useCallback(
      (newRowsWithoutEmpty: GridValidRowModel[]) => {
        setRows(newRowsWithoutEmpty);
        handleSaveAllClick();
      },
      [handleSaveAllClick],
    );

    const handleStopEditMode = useCallback(() => {
      const newModel: GridRowModesModel = {};
      rows.forEach((row) => {
        newModel[row.id] = { mode: GridRowModes.View };
      });
      propsRows.forEach((row) => {
        newModel[row.id] = { mode: GridRowModes.View };
      });
      setRowModesModel(newModel);
      setEditMode(false);
    }, [propsRows, rows]);

    useImperativeHandle(
      ref,
      () => ({
        startEditMode: () => {
          handleEditAllClick();
        },
        stopEditMode: () => {
          handleStopEditMode();
        },
        setRows: (newRowsWithoutEmpty: GridValidRowModel[]) => {
          handleOnDeleteEmptyRowCB(newRowsWithoutEmpty);
        },
      }),
      [handleEditAllClick, handleOnDeleteEmptyRowCB, handleStopEditMode],
    );

    const handleOnAddClick = () => {
      const id = rows.length + 1;
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          no: id,
          rowId: Math.floor(Math.random() * 999999999),
          name: "",
          percentage: "",
          phone: "",
          isNew: true,
        },
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
      }));
      setEditMode(true);
    };

    const handleRowEditStart = (
      params: GridRowParams,
      event: MuiEvent<React.SyntheticEvent>,
    ) => {
      event.defaultMuiPrevented = true;
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (
      params,
      event,
    ) => {
      event.defaultMuiPrevented = true;
    };

    const handleDeleteClick = (id: GridRowId) => () => {
      setRows(rows.filter((row) => row.id !== id));
    };

    const { text } = useLocale();

    const getTypeToTranslation = (type: string) => {
      switch (type) {
        case "recommend_to":
          return text("deposit_information_introducer_info_recommend_to");
        case "be_recommended":
          return text("deposit_information_introducer_info_be_recommended");
        default:
          return "---";
      }
    };

    const determineRequestTypeColumnLabel = (row: {
      credit_sale_permission: IDepositRequest["credit_sale_permission"];
    }) => {
      if (row.credit_sale_permission === 0) {
        return text(
          "deposit_information_introducer_info_column_created_request_id",
        );
      } else if (row.credit_sale_permission === 1) {
        return text(
          "deposit_information_introducer_info_column_source_request_id",
        );
      } else {
        return text(
          "deposit_information_introducer_info_column_created_request_id",
        );
      }
    };

    const fetchIntroducerByPhone = debounce(
      (phone_number: string, params: GridRenderEditCellParams, apiRef: GridApiRefType) => {
        apiRef.current.updateRows([{ id: params.id, isLoading: true }]);
        searchUserByPhoneNumber(
          {
            phoneNumber: phone_number,
          },
          {
            onSuccess: (data) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: "name",
                value: data?.name || "",
              });
              apiRef.current.setEditCellValue({
                id: params.id,
                field: "referral_code",
                value: data?.code,
              });
              apiRef.current.updateRows([{ id: params.id, isLoading: false }]);
            },
          },
        ).catch(() => {
          apiRef.current.setEditCellValue({
            id: params.id,
            field: "referral_code",
            value: "",
          });
          apiRef.current.setEditCellValue({
            id: params.id,
            field: "name",
            value: "",
          });
          apiRef.current.updateRows([{ id: params.id, isLoading: false }]);
        });
      },
      500,
    );

    const fetchIntroducerByReferralCode = debounce(
      (new_referral_code: string, params: GridRenderEditCellParams, apiRef: GridApiRefType) => {
        apiRef.current.updateRows([{ id: params.id, isLoading: true }]);
        checkUserReferralCodeByAdmin(
          {
            referral_code: new_referral_code,
          },
          {
            onSuccess: (data) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: "name",
                value: data?.name || "",
              });
              apiRef.current.setEditCellValue({
                id: params.id,
                field: "phone",
                value: data?.phone || "",
              });
              apiRef.current.updateRows([{ id: params.id, isLoading: false }]);
            },
          },
        ).catch(() => {
          apiRef.current.setEditCellValue({
            id: params.id,
            field: "phone",
            value: "",
          });
          apiRef.current.setEditCellValue({
            id: params.id,
            field: "name",
            value: "",
          });
          apiRef.current.updateRows([{ id: params.id, isLoading: false }]);
        });
      },
      500,
    );

    const handleOnChangePhoneNumber = (
      e: React.ChangeEvent<HTMLInputElement>,
      params: GridRenderEditCellParams,
      apiRef: GridApiRefType
    ) => {
      apiRef?.current.setEditCellValue({
        id: params.id,
        field: "phone",
        value: e.target.value,
      });
      apiRef?.current.updateRows([
        { id: params.id, isReferralCodeDisabled: e.target.value !== "" },
      ]);
      fetchIntroducerByPhone(e.target.value, params, apiRef);
    };

    const handleOnChangeReferralCode = (
      e: React.ChangeEvent<HTMLInputElement>,
      params: GridRenderEditCellParams,
      apiRef: GridApiRefType
    ) => {
      apiRef.current.setEditCellValue({
        id: params.id,
        field: "referral_code",
        value: e.target.value,
      });
      apiRef.current.updateRows([
        { id: params.id, isPhoneDisabled: e.target.value !== "" },
      ]);
      fetchIntroducerByReferralCode(e.target.value, params, apiRef);
    };

    const columns: GridColumns = [
      {
        ...sharedColDef,
        field: "no",
        headerName: text("deposit_information_introducer_info_column_no"),
        minWidth: 40,
        disableReorder: true,
      },
      {
        ...sharedColDef,
        field: "type",
        headerName: text("deposit_information_introducer_info_column_type"),
        minWidth: 160,
        editable: true,
        renderCell: ({ value }) => getTypeToTranslation(value as string),
        type: "singleSelect",
        valueOptions: [
          {
            value: "recommend_to",
            label: text("deposit_information_introducer_info_recommend_to"),
          },
          {
            value: "be_recommended",
            label: text("deposit_information_introducer_info_be_recommended"),
          },
        ],
      },
      {
        ...sharedColDef,
        field: "referral_code",
        headerName: text(
          "deposit_information_introducer_info_column_referral_code",
        ),
        minWidth: 120,
        type: "text",
        editable: true,
        renderCell: ({ value }) => (
          <div className="truncate">{value || "---"}</div>
        ),
        renderEditCell: (params) => <ReferralCodeEditCellInput params={params} handleOnChangeReferralCode={handleOnChangeReferralCode} />,
      },
      {
        ...sharedColDef,
        field: "percentage",
        headerName: text(
          "deposit_information_introducer_info_column_percentage",
        ),
        minWidth: 100,
        type: "number",
        editable: true,
        renderCell: ({ value }) => (value ? `${value}%` : "---"),
        renderEditCell: (params) => <PercentageEditCellInput params={params} />,
      },
      {
        ...sharedColDef,
        field: "name",
        headerName: text("deposit_information_introducer_info_column_name"),
        minWidth: 180,
        type: "text",
        editable: true,
        renderCell: ({ value }) =>
          value ? (
            <div className="w-full flex items-center justify-between">
              <span className="w-[150px] truncate flex-grow">{value}</span>
              <Link
                href={`/super-save/deposit-information?searchKey=${value}`}
                target="_blank"
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
          ) : (
            "---"
          ),
        renderEditCell(params) {
          return (
            <>
              {params.row.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <input
                    type="text"
                    value={params.value}
                    disabled
                    className="w-full disabled:bg-gray-100"
                  />
                </>
              )}
            </>
          );
        },
      },
      {
        ...sharedColDef,
        field: "phone",
        headerName: text(
          "deposit_information_introducer_info_column_phone_number",
        ),
        minWidth: 180,
        type: "text",
        editable: true,
        renderCell: ({ value }) => value || "---",
        renderEditCell: (params) => <PhoneNumberEditCellInput params={params} handleOnChangePhoneNumber={handleOnChangePhoneNumber} />
      },
      {
        ...sharedColDef,
        field: "request_id",
        headerName: determineRequestTypeColumnLabel(introducerCreditInfo),
        minWidth: 150,
        type: "text",
        editable: true,
        renderCell: ({ value }) =>
          value ? (
            <div className="w-full flex items-center justify-between">
              <span className="w-fit truncate">{value}</span>
              <Image
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(value)}
              />
            </div>
          ) : (
            "---"
          ),
      },
      {
        ...sharedColDef,
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        cellClassName: "actions",
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                key={id}
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
                placeholder={"Delete"}
                showInMenu={false}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              />,
            ];
          }

          return [];
        },
      },
    ];

    const handleProcessRowUpdateError = useCallback(
      (error: string) => {
        toast(error || "Error", {
          type: "error",
        });
        handleEditAllClick();
      },
      [handleEditAllClick],
    );

    return (
      <Fragment>
        <Box className="flex justify-end mt-5">
          <ShowToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
          />
          {editMode ? (
            <div className="pb-1 flex flex-col gap-2 items-end md:flex-row md:items-center test0303">
              <Alert
                sx={{
                  "&.MuiAlert-root": {
                    padding: "6px",
                  }
                }}
                className="flex-1 " severity="info">
                {text(
                  "deposit_information_introducer_info_phone_number_message",
                )}
              </Alert>
              <button
                onClick={handleOnAddClick}
                className="flex items-center justify-center md:ml-2 mr-5 text-sm px-4 max-w-[20px] h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed text-blue-500 rounded-md"
              >
                <AddOutlined />{" "}
                {text(
                  "deposit_information_introducer_info_action_button_add_text",
                )}
              </button>
              <button
                onClick={handleSaveAllClick}
                className="flex items-center justify-center md:mr-2 text-sm px-4 h-10 bg-green-500 text-white rounded-md"
              >
                {text(
                  "deposit_information_introducer_info_action_button_save_text",
                )}
              </button>
              <button
                onClick={handleCancelAllClick}
                className="flex items-center justify-center md:mr-2 text-sm px-4 h-10 bg-red-500 text-white rounded-md"
              >
                {text(
                  "deposit_information_introducer_info_action_button_cancel_text",
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                handleCheckMissingReferralCode();
                handleEditAllClick();
              }}
              className="flex items-center justify-center mr-2 text-sm px-4 h-10 disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed bg-blue-500 text-white rounded-md"
            >
              {text(
                "deposit_information_introducer_info_action_button_change_text",
              )}
            </button>
          )}
        </Box>
        <Box className="h-64 mt-4 overflow-x-auto">

          <DataGridPro
            apiRef={gridRef}
            rows={rows}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            componentsProps={{
              toolbar: { setRows, setRowModesModel },
            }}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            experimentalFeatures={{ newEditingApi: true }}
            paginationMode="server"
            rowCount={rows?.length || 0}
            hideFooter
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
          />
        </Box>
      </Fragment>
    );
  },
);

CheckIntroducerInfoGrid.displayName = "CheckIntroducerInfoGrid";

export default CheckIntroducerInfoGrid;
