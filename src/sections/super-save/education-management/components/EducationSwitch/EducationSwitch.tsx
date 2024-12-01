import { Switch } from "@mui/material";
import React, { useEffect } from "react";
import { IEducationSwitchProps } from "./types";

const EducationSwitch = ({ initialValue, onChange }: IEducationSwitchProps) => {
  const [checked, setChecked] = React.useState(initialValue);
  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);
  return (
    <Switch
      onClick={() => {
        setChecked(!checked);
        onChange(!checked);
      }}
      checked={checked}
      inputProps={{ style: { display: "none" } }}
    />
  );
};

export default EducationSwitch;
