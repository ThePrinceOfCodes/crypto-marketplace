import {
  DialogContent,
} from "@mui/material";
import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "../../../../locale";
import { AppConnectionModalProps, AppConnectionModalRef } from "./types";
import AppConnectionData from "./AppConectionData";
import CustomDialog from "@common/components/CustomDialog";

const AppConnectionModal = (
  props: AppConnectionModalProps,
  ref: Ref<AppConnectionModalRef>,
) => {
  const [open, setOpen] = useState(false);
  const { text } = useLocale();

  const {
    formState: { errors },
    reset,
  } = useForm();

  const onClose = () => {
    setOpen(false);
    reset();
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("user_details_basic_tab_app_connection")}
      maxWidth={"xl"}
    >
      <DialogContent>
        <AppConnectionData />
      </DialogContent>
    </CustomDialog>
  );
};

export default forwardRef(AppConnectionModal);
