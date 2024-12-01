import useMediaQuery from "@mui/material/useMediaQuery";

const useResponsive = () => {
  const isMobile = useMediaQuery("(max-width:800px)");
  const isTabletOrMobile = useMediaQuery("(max-width:1200px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const isBigScreen = useMediaQuery("(min-width: 1400px");

  return {
    isMobile,
    isDesktop: !isMobile,
    isTabletOrMobile: isTabletOrMobile,
    isTablet: isTablet,
    isBigScreen: isBigScreen,
  };
};

export default useResponsive;
