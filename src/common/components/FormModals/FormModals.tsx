import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormTypesProps } from "./types";
import { Spinner } from "../Spinner";
import { useLocale } from "locale";
import { Box } from "@mui/material";

const CommonDialog = ({
  titleText,
  onClose,
  open = false,
  children,
  isLoading = false,
  submitButtonId,
  submitButtonText,
  onFormSubmit,
}: FormTypesProps) => {
  const { text } = useLocale();
  return (
    <Dialog open={open} maxWidth="xs" fullWidth onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
            {titleText}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, columnGap: 2 }}>
        <button
          onClick={onClose}
          type="reset"
          className="w-full rounded-md border h-11 border-transparent bg-slate-200  text-sm font-medium text-slate-400 duration-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {text("common_cancel_button")}
        </button>
        <button
          id={submitButtonId}
          disabled={isLoading}
          onClick={onFormSubmit}
          type="submit"
          className="w-full h-11 bg-blue-500 text-white rounded-md"
        >
          {isLoading && <Spinner />}
          {submitButtonText}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CommonDialog;
