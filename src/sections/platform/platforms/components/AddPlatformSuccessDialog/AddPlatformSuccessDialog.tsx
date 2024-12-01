import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Box } from "@mui/material";
import FormFooter from "@common/components/FormFooter";
import { useLocale } from "locale";
import CustomDialog from "@common/components/CustomDialog";

interface PlatformSuccessDialogProps {
  open: boolean;
  handleClose: () => void;
}

const AddPlatformSuccessDialog = (props: PlatformSuccessDialogProps) => {
  const { text } = useLocale();

  return (
    <div>
      <CustomDialog
        open={props.open}
        onClose={props.handleClose}
        maxWidth="sm"
        fullWidth={false}
        titleText="   "
      >
        <div className="w-full flex flex-col items-center content-center justify-center px-10 pb-12">
          <CheckCircleIcon className="w-14 h-14 ml-3 mb-5 cursor-pointer mr-6 text-green-500" />
          <h2 className="font-semibold mb-3">{text("add_platform_success_dialog_header")}</h2>
          <span className="text-slate-500 text-xs text-center mb-6">
            {text("add_platform_success_dialog_content")}
          </span>
          <Box sx={{ display: "flex", columnGap: 2 }}>
            <FormFooter
              showCancelButton={false}
              onSubmit={props.handleClose}
              submitText={text("Done")}
            />
          </Box>
        </div>
      </CustomDialog>
    </div>
  );
};

export default AddPlatformSuccessDialog;
