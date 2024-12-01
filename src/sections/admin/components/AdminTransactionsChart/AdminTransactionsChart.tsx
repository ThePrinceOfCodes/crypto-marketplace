import { LineChart } from "@common/components/LineChart";
import { useGetTransactionsStatistics } from "api/hooks";
import { tailwindConfig } from "@common/utils/helpers";
import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { useLocale } from "locale";
import Datepicker from "react-tailwindcss-datepicker";
import { Spinner } from "@common/components/Spinner";
import dayjs from "dayjs";


function AdminTransactionsChart() {
  const { text } = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conf: any = tailwindConfig()?.theme?.colors;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [value, setValue] = useState<any>({
    startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const { isFetching, data, refetch } = useGetTransactionsStatistics(value);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "MSQ",
        data: [],
        fill: true,
        backgroundColor: "rgba(255, 99, 132,0.4)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: conf.red[500],
        clip: 20,
      },
      {
        label: "MSQX",
        data: [],
        fill: true,
        backgroundColor: "rgba(54, 162, 235,0.4)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: conf.blue[500],
        clip: 20,
      },
      {
        label: "P2U",
        data: [],
        fill: true,
        backgroundColor: "rgba(75, 192, 192,0.4)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: conf.green[500],
        clip: 20,
      },
      {
        label: "SUT",
        data: [],
        fill: true,
        backgroundColor: "rgba(255, 166, 0,0.4)",
        borderColor: "rgb(255, 166, 0, 192)",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: conf.orange[500],
        clip: 20,
      },
    ],
  });

  useEffect(() => {
    if (data && data.labels && data.chartData) {
      setChartData((prevData) => ({
        ...prevData,
        labels: data.labels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: data.chartData?.MSQ?.values,
          },
          {
            ...prevData.datasets[1],
            data: data.chartData?.MSQX?.values,
          },
          {
            ...prevData.datasets[2],
            data: data.chartData?.P2U?.values,
          },
          {
            ...prevData.datasets[3],
            data: data.chartData?.SUT?.values,
          },
        ],
      }));
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [value, refetch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (newValue: any) => {
    setValue(newValue);
  };

  const customShortcuts = {
    last7Days: {
      text: text("last_7_days"),
      period: {
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date(),
      },
    },
    last14Days: {
      text: text("last_14_Days"),
      period: {
        start: new Date(new Date().setDate(new Date().getDate() - 14)),
        end: new Date(),
      },
    },
    last30Days: {
      text: text("last_30_Days"),
      period: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date(),
      },
    },
    last3Months: {
      text: text("last_3_Months"),
      period: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        end: new Date(),
      },
    },
    last6Months: {
      text: text("last_6_Months"),
      period: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        end: new Date(),
      },
    },
    lastYear: {
      text: text("last_Year"),
      period: {
        start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        end: new Date(),
      },
    },
  };

  return (
    <div
      className={clsx(
        "flex flex-col h-[460px] w-[100%] xl:w-[50%] col-span-full sm:col-span-6 xl:col-span-4 bg-white " +
        " rounded-lg border border-slate-200",
      )}
    >
      <div className="px-5 pt-5 flex flex-col 2xl:flex-row 2xl:items-center justify-between ">
        <h2 className="text-lg inline-flex font-semibold text-slate-800 mb-2">
          {text("transactions")}
        </h2>
        <div className="flex w-full sm:w-[300px] 2xl:w-75 -mt-1 mb-2">
          <Datepicker
            value={value}
            primaryColor={"blue"}
            configs={{
              shortcuts: customShortcuts,
            }}
            popoverDirection="down"
            onChange={handleValueChange}
            showShortcuts={true}
            maxDate={dayjs().toDate()}
          />
        </div>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-full">
          <Spinner size={8} />
        </div>
      ) : (
        <div className="grow relative">
          {data && data.labels && (
            <LineChart data={chartData} width={"100%"} height={128} value={value} />
          )}
        </div>
      )}
    </div>
  );
}

export default AdminTransactionsChart;
