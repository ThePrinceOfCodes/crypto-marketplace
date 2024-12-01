import { DateFormatter } from "@common/components";
import { customisedTableClasses } from "@common/constants/classes";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
// import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import SaveNResetButtons from "@sections/shared-components/SaveNResetButtons";
// import { useDialog } from "@common/context";
import { useGetCardInformation, useDeleteUserCardDetails } from "api/hooks";
import { useLocale } from "locale";
import _debounce from "lodash/debounce";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "react-toastify";
import DeleteCardModal from "./components/DeleteCardModal";
import { CustomToolbar, ShowToolbar } from "@common/components/ShowToolbar";
import { useGridColumnChange } from "@common/hooks/useGridColumnChange";

const sharedColDef: GridColDef = {
  field: "",
  sortable: true
};


function CardInformation() {
  const { text } = useLocale();
  const prevScrollTopRef = useRef(0);
  const email = useRouter().query.email as string;

  // const [memoVal, setMemoVal] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const [openDeleteCardModal, setOpenDeleteCardModal] = useState(false);

  const { data, isLoading, isFetching } =
    useGetCardInformation({
      email,
    });

  // const copyToClipboard = (textToCopy: string) => {
  //   navigator.clipboard.writeText(textToCopy);
  //   toast(text("add_platform_copied_to_clipboard"), {
  //     type: "success",
  //     autoClose: 1500,
  //   });
  // };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedOnScroll = _debounce((e: any) => {
    const currentScrollTop = e?.target?.scrollTop;
    prevScrollTopRef.current = currentScrollTop;
  }, 500);


  const columns: GridColDef[] = useMemo(() => [
    {
      ...sharedColDef,
      field: "name",
      headerName: text("user_card_name"),
      minWidth: 200,
      width: 200,
    },
    {
      ...sharedColDef,
      field: "code",
      headerName: text("user_card_code"),
      minWidth: 200,
      width: 200,
    },
    {
      ...sharedColDef,
      field: "id",
      headerName: text("user_card_id"),
      minWidth: 200,
      width: 200,
      renderCell: ({ value }) => {
        return (
          <div className="flex items-center">
            <span className="w-[120px] truncate text-ellipsis">{value.substring(0, 3) + value.substring(3).split("").map(() => "*").join("")}</span>
          </div>
        );
      }
    },
    {
      ...sharedColDef,
      field: "password",
      headerName: text("user_card_password"),
      minWidth: 200,
      width: 200,
      renderCell: ({ value }) =>
        value && (
          <div className="flex flex-col w-full">
            <p className="truncate">{value.split("").map(() => "*").join("")}</p>
          </div>
        ),
    },
    {
      ...sharedColDef,
      field: "createdAt",
      headerName: text("user_card_created_at"),
      minWidth: 200,
      width: 200,
      renderCell: ({ value }) =>
        value && (
          <p className="truncate"><DateFormatter value={value} breakLine /></p>
        ),
    },
    {
      ...sharedColDef,
      field: "action",
      headerName: text("user_card_action"),
      minWidth: 200,
      width: 200,
      renderCell: ({ row }) =>
      (
        <button
          className="flex items-center text-xs px-2 h-6 bg-red-500 text-white rounded-md  mr-2"
          onClick={() => {
            /*handleDeleteCardInfo(row,memoVal)*/
            // setOpenConfirmDialog(true);
            setOpenDeleteCardModal(true)
            setSelectedId(row.id);
            setSelectedCode(row.code);
          }}
        >
          {text("user_card_btn_delete")}
        </button>
      ),
    },
  ], [text]);

  const userCardInfo =
    data?.result?.map((item) => ({ ...item })) || [];

  /* DataGrid Columns Reorder & Sort Handling Start */
  const {
    handleColumnChange,
    handleSaveView,
    handleResetDefault,
    restoreOrder,
    openConfirmDialog,
    apiRef,
    columnCurrentState,
    setOpenConfirmDialog,
  } = useGridColumnChange("cardInfoColumnState");

  useEffect(() => {
    restoreOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* DataGrid Columns Reorder & Sort Handling End */

  return (
    <div>
      <div className="flex gap-3 py-4 w-83vw h-36 overflow-x-auto">
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 rounded-lg h-24 w-56 border border-slate-300 px-4 py-3 flex-shrink-0">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("user_card_created_Start")}
            </span>
            <div className="flex gap-2">
              <span className="flex items-center font-medium text-sm">
                {data?.rpa?.createdAt ? (
                  <DateFormatter value={data?.rpa?.createdAt} showZone />
                ) : (
                  "---"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("user_card_created_End")}
            </span>
            <span className="flex items-center font-medium text-sm mt-1">
              {
                data?.rpa?.endDate ? (
                  <DateFormatter value={data?.rpa?.endDate} showZone />
                ) : "---"
              }
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("user_card_created_Sync")}
            </span>
            <span className="font-medium text-sm mt-1">
              {
                data?.rpa?.updatedAt ? (
                  <DateFormatter value={data?.rpa?.updatedAt} showZone />
                ) : "---"
              }
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className={"flex justify-between items-center my-4"}>
          <div className="text-gray-400 text-2xl  text-grey">
            {text("user_card_info_title")}
          </div>

          <div className="flex">
            <ShowToolbar showToolbar={showToolbar} setShowToolbar={setShowToolbar} />
            {(Object.keys(columnCurrentState).length > 0) &&
              <div className="flex">
                <SaveNResetButtons
                  saveHandler={() => setOpenConfirmDialog(true)}
                  resetHandler={handleResetDefault}
                  openConfirmDialog={openConfirmDialog}
                  setOpenConfirmDialog={setOpenConfirmDialog}
                  onYesHandler={handleSaveView}
                />
              </div>
            }
          </div>
        </div>
        <div
          onScrollCapture={debouncedOnScroll}
          className="w-full mt-2 bg-white tableContainer pb-10"
        >
          <DataGridPro
            rows={userCardInfo || []}
            rowCount={userCardInfo?.length || 0}
            getRowId={(row) => row?.code}
            columns={columns}
            loading={isFetching || isLoading}
            disableSelectionOnClick
            paginationMode="server"
            sx={customisedTableClasses}
            hideFooter
            apiRef={apiRef}
            onColumnOrderChange={() => handleColumnChange(false)}
            onSortModelChange={() => handleColumnChange(true)}
            components={{
              Toolbar: showToolbar ? CustomToolbar : null,
            }}
          />
        </div>
      </div>
      <DeleteCardModal
        open={openDeleteCardModal}
        email={email}
        id={selectedId}
        code={selectedCode}
        toggleOpen={setOpenConfirmDialog}
        onCancel={() => {
          setOpenDeleteCardModal(false);
        }}
      />
    </div>
  );
}

export default CardInformation;
