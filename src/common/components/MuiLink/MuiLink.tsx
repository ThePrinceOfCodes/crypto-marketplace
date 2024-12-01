import dynamic from "next/dynamic";

// Dynamically import MaterialUILink with SSR disabled
const MuiLink = dynamic(() => import("@mui/material/Link"), {
  ssr: false,
});

export default MuiLink;
