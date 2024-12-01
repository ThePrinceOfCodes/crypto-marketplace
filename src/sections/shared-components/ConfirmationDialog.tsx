import { Dialog, DialogContent, Button, Box } from "@mui/material";
import { useLocale } from "locale";
import ContainedMuiButton from "@common/components/MuiButton";
interface ConfirmationDialogProps {
  openConfirmDialog: boolean;
  setOpenConfirmDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onYesHandler: () => void;
  confirmMessage?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  openConfirmDialog,
  setOpenConfirmDialog,
  onYesHandler,
  confirmMessage = "save",
}) => {
  const { text } = useLocale();
  return (
    <Dialog
      maxWidth="xs"
      open={openConfirmDialog}
      PaperProps={{ style: { margin: "15px" } }}
    >
      <DialogContent>
        <div className="mb-5 text-center">
          <p className="mb-3">
            {text(
              confirmMessage === "save"
                ? "save_confirmation"
                : "reset_confirmation",
            )}
          </p>
        </div>

        <Box sx={{ display: "flex", columnGap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenConfirmDialog(false)}
          >
            {text("affiliate_register_cancel")}
          </Button>

          <ContainedMuiButton
            fullWidth
            onClick={() => {
              onYesHandler();
            //   setOpenConfirmDialog(false);
            }}
          >
            {text("affiliate_register_yes")}
          </ContainedMuiButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
