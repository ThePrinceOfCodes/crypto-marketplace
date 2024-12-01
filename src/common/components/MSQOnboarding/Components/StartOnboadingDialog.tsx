import React from "react";
import {
  Button,
  Dialog,
  CardMedia,
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
} from "@mui/material";
import { useLocale } from "locale";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

type Interface = {
  open: boolean;
  onClose?: () => void;
  onOk: () => void;
};

const StyledTypography = styled(Typography)(() => ({
  color: "rgba(0, 0, 0, 0.7)",
  textAlign: "center",
}));

const StartOnboardingDialog = ({ open, onClose, onOk }: Interface) => {
  const { text } = useLocale();
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundColor: "primary.main",
          color: "common.white",
        },
      }}
    >
      <Card sx={{ maxWidth: 340 }}>
        <Box sx={{ position: "absolute", top: 1, right: 2, zIndex: 999 }}>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>                                                                                                                                                                                                                                                                                                                                                                                                                     
        </Box>

        <CardMedia sx={{ height: 140 }} image="/images/welcome.jpeg" />

        <CardContent>
          <StyledTypography gutterBottom fontWeight={600}>
            {text("user_onboarding_welcome_title")}
          </StyledTypography>

          <StyledTypography variant="body2">
            {text("user_onboarding_welcome_description")}
          </StyledTypography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={onOk}
            sx={{ width: "100%" }}
            size="small"
            disableElevation
            autoFocus
            variant="contained"
          >
            {text("user_onboarding_welcome_button")}
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default StartOnboardingDialog;
