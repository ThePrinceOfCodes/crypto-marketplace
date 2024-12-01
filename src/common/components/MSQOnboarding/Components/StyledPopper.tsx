import { useState } from "react";
import { Box, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPopperComponent = styled(Popper)(({ theme }) => ({
  zIndex: 9999,
  backgroundColor: "white",
  borderRadius: 6,
  maxWidth: "320px",
  width: "100%",
  '&[data-popper-placement*="bottom"] .arrow': {
    top: 0,
    left: 0,
    marginTop: "-0.9em",
    width: "3em",
    height: "1em",
    "&::before": {
      borderWidth: "0 1em 1em 1em",
      borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
    },
  },
  '&[data-popper-placement*="top"] .arrow': {
    bottom: 0,
    left: 0,
    marginBottom: "-0.9em",
    width: "3em",
    height: "1em",
    "&::before": {
      borderWidth: "1em 1em 0 1em",
      borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
    },
  },
  '&[data-popper-placement*="right"] .arrow': {
    left: 0,
    marginLeft: "-0.9em",
    height: "3em",
    width: "1em",
    "&::before": {
      borderWidth: "1em 1em 1em 0",
      borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
    },
  },
  '&[data-popper-placement*="left"] .arrow': {
    right: 0,
    marginRight: "-0.9em",
    height: "3em",
    width: "1em",
    "&::before": {
      borderWidth: "1em 0 1em 1em",
      borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
    },
  },
}));

const styles = {
  arrow: {
    position: "absolute",
    fontSize: 7,
    width: "3em",
    height: "3em",
    "&::before": {
      content: '""',
      margin: "auto",
      display: "block",
      width: 0,
      height: 0,
      borderStyle: "solid",
    },
  },
};

const StyledPopper = ({
  children,
  open,
  anchorEl,
}: Readonly<{
  children: React.ReactNode;
  open: boolean;
  anchorEl: HTMLElement | null;
}>) => {
  const [arrowRef, setArrowRef] = useState(null);

  return (
    <StyledPopperComponent
      open={open}
      anchorEl={anchorEl}
      modifiers={[
        {
          name: "flip",
          enabled: true,
          options: {
            altBoundary: true,
            rootBoundary: "document",
            padding: 8,
          },
        },
        {
          name: "offset",
          options: {
            offset: [0, 10],
          },
        },
        {
          name: "arrow",
          enabled: true,
          options: {
            element: arrowRef,
          },
        },
        {
          name: "preventOverflow",
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: "document",
            padding: 8,
          },
        },
      ]}
    >
      <Box
        component="span"
        className="arrow"
        ref={setArrowRef}
        sx={styles.arrow}
      />
      {children}
    </StyledPopperComponent>
  );
};

export default StyledPopper;
