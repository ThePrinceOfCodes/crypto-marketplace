// import useResponsive from "@common/hooks/useResponsive";
import clsx from "clsx";
import React, { useCallback } from "react";
import { useGetTopTokens } from "api/hooks";
import { useLocale } from "locale";
import { Tooltip } from "@mui/material";
import { Spinner } from "@common/components";

function AdminRequestsChart() {
  const { text } = useLocale();
  const getListQuery = useGetTopTokens();
  const { data, isLoading } = getListQuery;
  const [onHover, setOnHover] = React.useState(false);
  const [disableTooltip, setDisableTooltip] = React.useState(false);

  const ref = useCallback < (node: HTMLDivElement) => void> ((node) => {
    if (node) {
      setDisableTooltip(!(node.scrollWidth > node.offsetWidth));
    }
  }, []);

  return (
    <div className={clsx("flex flex-col h-[460px] w-[100%] xl:w-[50%] col-span-full sm:col-span-6 xl:col-span-4 " +
      "bg-white rounded-lg border border-slate-200 xl:ml-5")}>
      <div className="px-5 pt-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          {text("requests")}
        </h2>
        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">
          {text("top_3")}
        </div>
      </div>

      <div className={`flex ${isLoading ? "items-center justify-center" : ""} h-full n-transactions-card`}>
        {isLoading ? <Spinner size={8} /> : data && data.length ? (
          <div className="first h-52 w-52 ml-12 mt-8 bg-blue-700 rounded-full text-white flex items-center justify-center flex-col">
            <span>{data[0].requests}</span>
            <span className="text-xs p-2 pt-0 w-[inherit] whitespace-nowrap overflow-hidden overflow-ellipsis text-center">
              {data[0].tokenName}
            </span>
            {data.length > 1 && (
              <div className="second h-36 w-36 bg-zinc-200 rounded-full items-center text-black justify-center flex flex-col">
                <span>{data[1].requests}</span>
                <span className="text-xs p-2 pt-0 w-[inherit] whitespace-nowrap overflow-hidden overflow-ellipsis text-center">
                  {data[1].tokenName}
                </span>
              </div>
            )}
            {data.length > 2 && (
              <Tooltip
                title={data[2].tokenName}
                open={!disableTooltip && onHover}
              >
                <div
                  onMouseEnter={() => setOnHover(true)}
                  onMouseLeave={() => setOnHover(false)}
                  className="last w-24 h-24 bg-gray-900 rounded-full text-white flex items-center justify-center flex-col border-2"
                >
                  <span>{data[2].requests}</span>
                  <span
                    ref={ref}
                    className="text-xs p-2 pt-0 w-[inherit] whitespace-nowrap overflow-hidden overflow-ellipsis text-center"
                  >
                    {data[2].tokenName}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>
        ) :
          (<span>{text("no_transaction")}</span>)
        }
      </div>
    </div>
  );
}

export default AdminRequestsChart;
