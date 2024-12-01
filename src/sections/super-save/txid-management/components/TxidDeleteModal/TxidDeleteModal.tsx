/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Box } from "@mui/material";
import { useLocale } from "locale";
import { ITxidDeleteModalProps } from "./types";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

function TxidDeleteModal({
  open,
  onCancel,
  onDelete,
  isSubmitting,
  selectedTxid,
}: ITxidDeleteModalProps) {
  const { text } = useLocale();

  function shortenString(inputString: string, lengthToShow = 4) {
    if (inputString == null) {
      return "";
    }

    if (inputString.length <= lengthToShow * 2 + 2) return inputString;

    const prefix = inputString.substring(0, lengthToShow + 2);
    const suffix = inputString.substring(inputString.length - lengthToShow);

    return `${prefix}...${suffix}`;
  }

  const handleOnDelte = () => {
    onDelete(selectedTxid);
  }

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={text("delete_txid_modal_title")}
    >
      <Box sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}>

        <div >
          {text("delete_txid_modal_warning")}{" "}
          <span className="font-medium"> {shortenString(selectedTxid)} </span> ?{" "}
        </div>
        <Box sx={{ display: "flex", columnGap: 2 }} >
          <FormFooter
            cancelText={text("add_news_cancel_btn_text")}
            handleClose={onCancel}
            loading={isSubmitting}
            onSubmit={handleOnDelte}
            submitText={text("txid_management_deletion")}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
}

export default TxidDeleteModal;
