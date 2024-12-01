import {
  Typography,
  Box,
  Button,
  Modal,
  Stack,
  IconButton,
} from "@mui/material";
import { Popper, StartOnboardingDialog } from "./Components";
import { useEffect, useRef, useState } from "react";
import { useLocale, LocalKeys } from "locale";
import { useAuth } from "@common/context";
import { dashboardSteps } from "@common/constants/onboardingSteps";
import CloseIcon from "@mui/icons-material/Close";
import useResponsive from "@common/hooks/useResponsive";

const MSQOnboarding = ({
  page,
  steps,
  setSteps,
  setPage,
}: {
  page: string;
  steps: Array<{ id: string; description: string }>;
  setSteps: (
    args: Array<{ id: string; description: string; key?: string }>,
  ) => void;
  setPage: (args: string) => void;
}) => {
  const onboardingStatus =
    (typeof window !== "undefined" &&
      JSON.parse(localStorage.getItem("onboardingStatus") as string)) ||
    {};

  // fetch updates things

  const { userRoleV2, hasAuth } = useAuth();

  const handleUpdateSteps = () => {
    if (hasAuth("root")) {
      return setSteps(dashboardSteps);
    }
   
     if (userRoleV2) {
       const commonSteps = [
         "dashboard",
         "changeTimeZone",
         "changeLanguage",
         "profile",
       ];
       const isNewUser = Object.keys(userRoleV2).length === 0;

       const defaultSteps = isNewUser
         ? [...commonSteps, "platform"]
         : commonSteps;

       const filteredSteps = dashboardSteps.filter(
         (step: { id: string; description: string; key: string }) => {
           return (
             defaultSteps.includes(step?.key) ||
             userRoleV2[step?.key]?.length > 0
           );
         },
       );

       setSteps(filteredSteps);
     }
  };

  const modalRef = useRef<HTMLDivElement | null>(null);

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [prevActiveStep, setPrevActiveStep] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [elementPosition, setElementPosition] = useState<
    DOMRect | null | undefined
  >(null);
  const [windowHeight, setWindowHeight] = useState<number | null>(null);

  const { text } = useLocale();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useResponsive();
  const { id: title, description } = steps[activeStep as number] || "";

  const isLastStep = () => activeStep === steps.length - 1;
  const open =
    Boolean(anchorEl) && isAuthenticated && steps.length > 0 && !isMobile;

  useEffect(() => {
    if (steps.length > 0) {
      setActiveStep(0);
    }
  }, [steps]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef && modalRef.current?.contains(event.target as Node)) {
        removeStyles(activeStep as number);
        reset();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anchorEl, activeStep]);

  function getElement(id: string) {
    return document?.getElementById(id);
  }

  function scrollToView(step: number) {
    const { id } = steps[step];
    getElement(id)?.scrollIntoView();
  }

  function removeStyles(step: number) {
    const { id } = steps[step];

    const element = getElement(id);

    if (element) {
      element.style.zIndex = "";
      element.classList.remove("bg-slate-50");
      element.classList.remove("text-slate-400");
      element.classList.remove("rounded-lg");
    }
  }

  function applyStyles(element: HTMLElement | null) {
    if (element) {
      element.style.zIndex = "9999";
      element.classList.add("bg-slate-50");
      element.classList.add("!text-slate-400");
      element.classList.add("rounded-lg");
    }
  }

  function cleanUpLastStep() {
    removeStyles(steps.length - 1);
  }

  useEffect(() => {
    if (activeStep == 0) {
      scrollToView(0);
    }

    function cleanup() {
      if (prevActiveStep != null) {
        removeStyles(prevActiveStep);
      }
    }

    if (activeStep !== null) {
      const { id } = steps[activeStep];

      const element = getElement(id);
      setElementPosition(element?.getBoundingClientRect());

      applyStyles(element);

      if (windowHeight && elementPosition) {
        const shouldScrollToBottom =
          windowHeight - elementPosition.bottom < 250;
        const shouldScrollToTop = elementPosition.top < 100 && activeStep !== 0;

        if (shouldScrollToTop) {
          scrollToView(activeStep - 1);
        }

        if (shouldScrollToBottom) {
          scrollToView(activeStep + 1);
        }
      }

      setAnchorEl(element);
    }

    cleanup();
  }, [activeStep, steps, prevActiveStep]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const handleNext = () => {
    setPrevActiveStep(activeStep);
    if (isLastStep()) {
      setActiveStep(null);
      setAnchorEl(null);
      reset();
      cleanUpLastStep();
    } else {
      setActiveStep((prevVal: number | null) => (prevVal as number) + 1);
    }
  };

  const handlePrev = () => {
    setPrevActiveStep(activeStep);
    setActiveStep((prevVal: number | null) => (prevVal as number) - 1);
  };

  const reset = () => {
    if (!onboardingStatus["isUserOnboarded"]) {
      onboardingStatus["isUserOnboarded"] = true;
    }

    if (!onboardingStatus[page]) {
      onboardingStatus[page] = true;
    }

    localStorage.setItem("onboardingStatus", JSON.stringify(onboardingStatus));
    setAnchorEl(null);
    setSteps([]);
    setPage("");
    setPrevActiveStep(null);
    setActiveStep(null);
  };

  const handleOnModalOkay = () => {
    setActiveStep(0);
    handleUpdateSteps();
    setPage("dashboard");

    onboardingStatus["isUserOnboarded"] = true;
    onboardingStatus["dashboard"] = true;
    localStorage.setItem("onboardingStatus", JSON.stringify(onboardingStatus));
  };

  return (
    <>
      <Modal open={open} ref={modalRef}>
        <Popper open={open} anchorEl={anchorEl}>
          <Box sx={{ padding: 2 }}>
            <Stack
              sx={{ mb: 1 }}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontWeight: 600 }}>
                {text(title as LocalKeys)}
              </Typography>

              <IconButton
                onClick={() => {
                  removeStyles(activeStep as number);
                  reset();
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography sx={{ fontSize: 14 }}>
              {text(description as LocalKeys)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                columnGap: 2,
                marginTop: 2,
              }}
            >
              <Button
                onClick={handlePrev}
                disabled={activeStep === 0 || !activeStep}
                size="small"
                variant="outlined"
                disableElevation
              >
                {text("user_onboarding_button_prev")}
              </Button>
              <Button
                onClick={handleNext}
                disableElevation
                size="small"
                variant="contained"
              >
                {isLastStep()
                  ? text("user_onboarding_button_done")
                  : `${text("user_onboarding_button_next")} (${(activeStep as number) + 1}/${steps.length})`}
              </Button>
            </Box>
          </Box>
        </Popper>
      </Modal>

      <StartOnboardingDialog
        onOk={handleOnModalOkay}
        open={
          isAuthenticated &&
          !onboardingStatus["isUserOnboarded"] &&
          steps.length === 0
        }
        onClose={reset}
      />
    </>
  );
};

export default MSQOnboarding;
