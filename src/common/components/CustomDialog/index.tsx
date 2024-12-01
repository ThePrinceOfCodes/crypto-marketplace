import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import { PropsInterface } from "./types";
import CloseIcon from "@mui/icons-material/Close";

const CustomDialog = ({
  titleText,
  onClose,
  open = false,
  children,
  maxWidth = "xs",
  className,
  fullWidth = true,
  renderHeader,
}: PropsInterface) => {
  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onClose={onClose}
      PaperProps={{
        className,
      }}
    >
      <DialogTitle sx={{ pb: 0.5, pt: 2, pr: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {React.isValidElement(renderHeader?.()) && renderHeader()}
          {titleText && <h2 className="font-medium text-xl">{titleText}</h2>}
          <IconButton onClick={onClose} aria-label="close icon">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ paddingY: 1 }}>{children}</Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
