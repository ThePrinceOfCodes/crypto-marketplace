import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { useLocale } from "locale";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const ExportButton = (props: ButtonProps & { loading?: boolean }) => {
  const { text } = useLocale();

  return (
    <GridToolbarContainer
      sx={{
        justifyContent: "flex-end",
      }} 
    >
      <Button
        size="small"
        variant="outlined"
        startIcon={
          props.loading ? <CircularProgress size={16} /> : <CloudDownloadIcon />
        }
        {...props}
      >
        {text("affiliate_store_excel_download_title")}
      </Button>
    </GridToolbarContainer>
  );
};

export default ExportButton;
