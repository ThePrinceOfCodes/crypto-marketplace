import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Box, Dialog, DialogContent, DialogContentText } from "@mui/material";
import {
  DialogContextType,
  AlertDialogProps,
  ConfirmDialogProps,
} from "./types";
import { htmlIds } from "@cypress/utils/ids";
import FormFooter from "@common/components/FormFooter";
import { useLocale } from "locale";
import CustomDialog from "@common/components/CustomDialog";

const DialogContext = createContext<DialogContextType | null>(null);

const DialogProvider = ({ children }: { children: ReactNode }) => {
  const { text } = useLocale();
  const [alertDialogProps, setAlertDialogProps] =
    useState<AlertDialogProps | null>(null);
  const [confirmProps, setConfirmProps] = useState<ConfirmDialogProps | null>(
    null,
  );
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reason, setReason] = useState("");

  const confirmDialog = useCallback((props: ConfirmDialogProps) => {
    setConfirmProps(props);
  }, []);

  const alertDialog = useCallback((props: AlertDialogProps) => {
    setAlertDialogProps(props);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmProps(null);
    confirmProps?.onCancel?.();
  }, [confirmProps]);

  const handleConfirm = useCallback(() => {
    setConfirmLoading(true);
    if (confirmProps?.onOk) {
      confirmProps?.onOk?.()?.then(() => {
        setConfirmLoading(false);
        setConfirmProps(null);
        setReason("");
      });
    } else {
      setConfirmLoading(false);
      setConfirmProps(null);
      setReason("");
    }
  }, [confirmProps]);

  const handleAlertDialog = useCallback(() => {
    if (alertDialogProps?.onOk) {
      alertDialogProps?.onOk?.()?.finally(() => {
        setAlertDialogProps(null);
      });
    } else {
      setAlertDialogProps(null);
    }
  }, [alertDialogProps]);

  const value = useMemo(
    () => ({
      confirmDialog,
      alertDialog,
      reason,
      setReason,
    }),
    [confirmDialog, alertDialog, reason, setReason],
  );

  return (    
    <DialogContext.Provider value={value}>
      {/* CONFIRM DIALOG */}
      <CustomDialog
        open={!!confirmProps}
        onClose={handleConfirmClose}
        titleText={confirmProps?.title}
      >
        <DialogContentText>{confirmProps?.content}</DialogContentText>
            {confirmProps?.warning && confirmProps.warning}
          {confirmProps?.requiredReason && (
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md mt-4 mb-8"
              placeholder={confirmProps?.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
          <Box sx={{ display: "flex", mt: 3, columnGap: 2 }}>
            <FormFooter
              handleClose={handleConfirmClose}
              loading={confirmLoading}
              cancelText={confirmProps?.cancelButtonText || text("common_no_button")}
              submitText={confirmProps?.okButtonText || text("common_yes_button")}
              disabled={confirmLoading}
              onSubmit={handleConfirm}
              submitBtnId={htmlIds.btn_confirmation_dialog_yes}
              cancelBtnId={htmlIds.btn_confirmation_dialog_no}
            />
          </Box>
        </CustomDialog>
      {/* ALERT DIALOG */}
      <Dialog open={!!alertDialogProps} PaperProps={{
        style: {
          margin: "15px"
        },
      }}>
        <DialogContent className="flex flex-col items-center">
          <p className="mb-5">{alertDialogProps?.title}</p>
          <button
            id={htmlIds.btn_alert_dialog_ok}
            type="submit"
            onClick={handleAlertDialog}
            className="group rounded-md border border-transparent bg-blue-600 py-2 px-10 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {alertDialogProps?.okButtonText || text("common_ok_button")}
          </button>
        </DialogContent>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};

const useDialog = () => {
  const value = useContext(DialogContext);
  if (!value) {
    throw Error("useDialog only be called inside dialog provider!");
  }
  return value;
};

export { useDialog, DialogContext, DialogProvider };
