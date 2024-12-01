import React, { useRef, useEffect } from "react";

import {
  Chart,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-moment";
import { Download } from "@mui/icons-material";
import dayjs from "dayjs";

Chart.register(
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
);

function LineChart({
  data,
  width,
  height,
  value
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  width: string | number;
  height: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current !== null) {
      const chart = new Chart(canvas.current, {
        type: "line",
        data: data,
        options: {
          backgroundColor: "white",
          layout: {
            padding: 10,
          },
          scales: {
            y: {
              display: true,
              beginAtZero: true,
            },
            x: {
              type: "time",
              time: {
                parser: "YYYY-MM-DD",
                unit: "day",
              },
              display: true,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const date = new Date(tooltipItem.parsed.x);
                  return "Date: " + date.toISOString().split("T")[0];
                },
                title: function (tooltipItems) {
                  const tooltipItem = tooltipItems[0];
                  return (
                    tooltipItem.dataset.label + ": " + tooltipItem.parsed.y
                  );
                },
              },
            },
            legend: {
              display: true,
            },
          },
          interaction: {
            intersect: false,
            mode: "nearest",
          },
          maintainAspectRatio: false,
        },
      });

      return () => chart.destroy();
    }
  }, [data]);


  const getFormattedDateRange = (value: {
    startDate?: string;
    endDate?: string;
  }): string => {
    const format = (date?: string) => date ? dayjs(date).format("YYYY-MMM-DD") : dayjs().format("YYYY-MMM-DD");
    return value.startDate && value.endDate ? `${format(value.startDate)} - ${format(value.endDate)}` : format(value.startDate) || format(value.endDate);
  };

  const handleDownload = () => {
    if (canvas.current) {
      const url = canvas.current.toDataURL("image/png");

      const formattedDate = `${getFormattedDateRange(value)}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `chart-${formattedDate}.png`;
      a.click();
    }
  };

  return (
    <>
      <canvas ref={canvas} width={width} height={height}></canvas>
      <button
        aria-label="download"
        className="rounded-md px-2 text-white bg-blue-300 hover:bg-blue-500 min-h-8 absolute right-5 top-[1px] text-sm"
        onClick={handleDownload}
      >
        <Download fontSize="small" />
      </button>
    </>
  );
}

export default LineChart;
