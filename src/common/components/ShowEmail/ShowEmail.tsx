import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { useLocale } from "locale";

const ShowEmail = ({ showEmail, setShowEmail }: { showEmail: boolean, setShowEmail: (show: boolean) => void }) => {
  const { text } = useLocale();

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={showEmail}
          onChange={() => setShowEmail(!showEmail)}
        />
      }
      label={text("checkbox_show_email_label")}
    />)
    ;
};

export default ShowEmail;
