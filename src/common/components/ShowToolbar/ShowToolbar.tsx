import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { useLocale } from "locale";
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from "@mui/x-data-grid";

const ShowToolbar = ({ showToolbar, setShowToolbar }: { showToolbar: boolean, setShowToolbar: (show: boolean) => void }) => {
  const { text } = useLocale();

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={showToolbar}
          onChange={() => setShowToolbar(!showToolbar)}
        />
      }
      label={text("checkbox_show_toolbar_label")}
    />
  );
};

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <GridToolbarFilterButton placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <GridToolbarDensitySelector placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    </GridToolbarContainer>
  );
}

export { ShowToolbar, CustomToolbar };
