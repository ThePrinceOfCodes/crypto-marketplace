import React from "react";
import { Button } from "@mui/material";
import { Spinner } from "../Spinner";
import ContainedMuiButton from "../MuiButton";

type Interface = {
  handleClose?: (args: any) => void;
  loading?: boolean;
  cancelText?: string;
  submitText: string;
  cancelBtnId?: string;
  submitBtnId?: string;
  disabled?: boolean;
  onSubmit?: (args: any) => void;
  showCancelButton?: boolean;
  sx?: object;
};

const FormFooter = ({
  handleClose,
  loading = false,
  disabled = false,
  cancelText,
  submitText,
  cancelBtnId,
  submitBtnId,
  onSubmit,
  showCancelButton = true,
  sx,
}: Interface) => {
  return (
    <>
      {showCancelButton && (
        <Button
          id={cancelBtnId}
          disabled={loading}
          onClick={handleClose}
          variant="outlined"
          type="reset"
          size="large"
          fullWidth
          sx={{ ...sx }}
        >
          {cancelText}
        </Button>
      )}
      <ContainedMuiButton
        id={submitBtnId}
        disabled={loading || disabled}
        disableElevation
        type="submit"
        fullWidth
        onClick={onSubmit}
        sx={{ ...sx }}
      >
        {loading && <Spinner />}
        {submitText}
      </ContainedMuiButton>
    </>
  );
};

export default FormFooter;
