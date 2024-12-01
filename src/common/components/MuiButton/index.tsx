import React from "react";
import { Button, ButtonProps } from "@mui/material";

type AdditionalProps = {
  children?: React.ReactNode;
};

type PropsInterface = ButtonProps & AdditionalProps;

const ContainedMuiButton = (props: PropsInterface) => {
  const { children, size } = props;

  return (
    <Button
      variant="contained"
      size={size || "large"}
      sx={{
        backgroundColor: "#3b82f6 !important",
        color: "#fff !important",
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ContainedMuiButton;
