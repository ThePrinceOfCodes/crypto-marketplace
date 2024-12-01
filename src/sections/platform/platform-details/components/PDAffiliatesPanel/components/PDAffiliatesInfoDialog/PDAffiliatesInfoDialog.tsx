import React, {
  // useMemo,
  useRef,
  useState,
} from "react";
import { DataRow } from "@common/components";
import { Box, Button, Modal, Typography } from "@mui/material";
import { useLocale } from "locale";
import { XMarkIcon } from "@heroicons/react/24/outline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IPDAffiliatesInfoDialogProps } from "./types";
import { DateFormatter } from "@common/components";
// import { DataGridPro } from "@mui/x-data-grid-pro";
// import { customisedTableClasses } from "@common/constants/classes";
import {
  ViewFilesModal,
  ViewFilesModalRef,
} from "@sections/user-details/components";

function PDAAffiliatesInfoDialog({
  open,
  onCancel,
  data,
}: IPDAffiliatesInfoDialogProps) {
  const { text } = useLocale();

  const handleOnCancel = () => {
    onCancel();
  };

  const viewCompanyDocumentFilesModal = useRef<ViewFilesModalRef>(null);
  const viewCompanyImageFilesModal = useRef<ViewFilesModalRef>(null);
  const [modalFileUrl, setModalFileUrl] = useState("");

  // const columns = useMemo(() => [
  //     {
  //         field: "merchange_company",
  //         headerName: "Merchant Company",
  //         flex: 1,
  //     },
  //     {
  //         field: "merchange_code",
  //         headerName: "Merchant Code",
  //         flex: 1,
  //     },
  // ], []);
  // const rowsWithIndex = useMemo(() => data?.merchant_codes?.map((el, index) => ({ ...el, id: index })) || [], [data]);
  return (
    <Modal
      open={open}
      onClose={handleOnCancel}
      className="justify-center items-center flex"
    >
      <Box className="min-w-[500px] flex flex-col items-center bg-white py-[20px] px-[24px]">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <Typography>{"Store Information"}</Typography>
            <button
              aria-label="close icon"
              className="flex items-start text-slate-400 h-8 w-8"
              onClick={handleOnCancel}
            >
              <XMarkIcon className="h-8 w-8 p-1" />
            </button>
          </div>
        </div>
        <div className="w-full">
          <DataRow label={text("affiliate_info_name")} value={data?.name} />
          <DataRow
            label={text("affiliate_info_address")}
            value={data?.address}
          />
          <DataRow
            label={text("affiliate_info_business_number")}
            value={data?.code}
          />
          {data?.user_id && (
            <DataRow
              label={text("affiliate_info_user_id")}
              value={data?.user_id}
            />
          )}
          {data?.image_url && (
            <DataRow
              label={text("affiliate_info_company_image")}
              value={
                <>
                  <button
                    className="flex items-center text-xs px-5 py-1.5 bg-blue-500 text-white rounded"
                    onClick={() => {
                      setModalFileUrl(data.image_url);
                      viewCompanyImageFilesModal.current?.open();
                    }}
                  >
                    {text("popup_page_column_view")}
                  </button>

                  <ViewFilesModal
                    ref={viewCompanyImageFilesModal}
                    files={[
                      { file_name: "popup_images", file_url: modalFileUrl },
                    ]}
                  />
                </>
              }
            />
          )}
          {data?.company_document && (
            <DataRow
              label={text("affiliate_info_company_document")}
              value={
                <>
                  <Button
                    onClick={() =>
                      viewCompanyDocumentFilesModal.current?.open()
                    }
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                  >
                    {text("basic_information_view_files")}
                  </Button>
                  <ViewFilesModal
                    ref={viewCompanyDocumentFilesModal}
                    files={[
                      {
                        file_name: "company_document",
                        file_url: data?.company_document,
                      },
                    ]}
                  />
                </>
              }
            />
          )}

          {data?.createdAt && (
            <DataRow
              label={text("affiliate_info_company_time_of_creation")}
              value={<DateFormatter value={data?.createdAt?.toString()} />}
            />
          )}

          {data?.updatedAt && (
            <DataRow
              label={text("affiliate_info_company_time_of_update")}
              value={<DateFormatter value={data?.updatedAt?.toString()} />}
            />
          )}

          {/* <div className="w-full bg-white h-[48vh] py-2">
                        <DataGridPro
                            getRowId={(row) => row?.id}
                            rows={rowsWithIndex}
                            columns={columns}
                            disableSelectionOnClick
                            sx={customisedTableClasses}
                            hideFooter
                            paginationMode="server"
                            rowCount={rowsWithIndex.length}
                        />
                    </div> */}
        </div>
      </Box>
    </Modal>
  );
}

export default PDAAffiliatesInfoDialog;
