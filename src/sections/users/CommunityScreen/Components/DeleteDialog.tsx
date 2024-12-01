import React from "react";
import {
  DialogContentText,
  Box,
} from "@mui/material";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { useLocale } from "locale";

type Interface = {
  onClose: () => void;
  open: boolean;
  handleDelete: () => void;
  isLoading: boolean;
  deleteData: number;
};

const DeleteDialog = ({
  open,
  onClose,
  handleDelete,
  isLoading,
  deleteData,
}: Interface) => {

  const { text } = useLocale();

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={`${text("community_form_delete")}  ${deleteData === 1 ? text("community") : `${deleteData} ${text("communities")}`
        }?`}
    >
      <DialogContentText>
        {`${text("community_form_warning_msg")} ${deleteData === 1 ? text("single_community_selected") : text("multiple_community_selected")
          }?  ${text("community_form_info_msg")} `}
      </DialogContentText>
      <Box sx={{ display: "flex", mt: 3, columnGap: 2 }}>
        <FormFooter
          handleClose={onClose}
          onSubmit={handleDelete}
          loading={isLoading}
          cancelText={text("community_form_cancel")}
          submitText={text("community_form_delete")}
        />
      </Box>
    </CustomDialog >
  );
};

export default DeleteDialog;
