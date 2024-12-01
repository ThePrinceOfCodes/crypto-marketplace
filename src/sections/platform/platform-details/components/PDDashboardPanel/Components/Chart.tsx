import { useRef, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";
import { saveAs } from "file-saver";
import { toBlob } from "html-to-image";
import { useLocale } from "locale";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

interface Props {
  chartName: string;
  data: Array<{
    id: number;
    value: number;
    label: string;
  }>;
  chartHeight?: number;
}

const Chart = ({ data, chartName, chartHeight }: Props) => {
  const chartRef = useRef(null);
  const {text} = useLocale();
  const [downloadingImage,setDownloadingImage] = useState<boolean>(false);

  const handleDownload = () => {
    setDownloadingImage(true)
    if (chartRef.current) {
      toBlob(chartRef.current).then((blob) => {
        blob && saveAs(blob, `${chartName}.png`);
      }).finally(() => {
        setDownloadingImage(false);
      });
    }
    else {
      setDownloadingImage(false); // Reset state if chartRef is not available
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 1,
        }}
      >
       <Box  sx={{
         display: "flex",
         alignItems: "center",
       }}>
         <button
           aria-label="download button"
           className="rounded-md z-[999] px-2 text-white bg-blue-300 hover:bg-blue-500 duration-500 min-h-8 text-sm"
           onClick={handleDownload}
           disabled={data.length === 0 || downloadingImage}
         >
           <CloudDownloadIcon fontSize="small" />
         </button>

         {
            downloadingImage && <CircularProgress size={20} sx={{marginLeft: 2}} />
         }
       </Box>

        <Typography variant="body2">{text("top_4")}</Typography>
      </Box>

      <Divider />

      <Box sx={{ width: "100%", flex: 1 }} ref={chartRef}>
        <PieChart
          height={chartHeight}
          series={[
            {
              data,
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 5,
            },
          ]}
          slotProps={{
            legend: {
              position: {
                vertical: "middle",
                horizontal: "right",
              },
              labelStyle: { fontSize: 12, width: "5%" },
              direction: "column",
              itemMarkWidth: 10,
              itemMarkHeight: 2,
              markGap: 5,
              itemGap: 10,
              padding: 0,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Chart;