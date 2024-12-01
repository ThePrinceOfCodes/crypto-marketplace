import { Avatar } from "@mui/material";
import React from "react";
import MSQIcon from "@common/icons/MSQIcon";
import MSQXIcon from "@common/icons/MSQXIcon";
import P2UIcon from "@common/icons/P2UIcon";
import DefaultLogoIcon from "@common/icons/DefaultLogoIcon";
import { useGetDashboardPrices, useGetP2PWalletBalance } from "api/hooks";
import { formatNumberWithCommas } from "@common/utils/formatters";
import { Spinner } from "@common/components";
import CountUp from "react-countup";
import { useLocale } from "locale";


function AdminPrices() {
  const getListQuery = useGetDashboardPrices();
  const getP2PBalanceQuery = useGetP2PWalletBalance();
  const {text} = useLocale();

  const { data } = getListQuery || [];
  const { data: P2PWalBalance, isLoading } = getP2PBalanceQuery || [];

  const prices = data ? data : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prices.forEach((p: any) => {
    switch (p.token) {
      case "MSQ":
        p.logo = <MSQIcon />;
        break;
      case "MSQX":
        p.logo = <MSQXIcon />;
        break;
      case "P2U":
        p.logo = <P2UIcon />;
        break;
      case "POL":
        p.logo = <Avatar src="/images/iconpng-matic.png" alt="Matic image" aria-label="Matic" />;
        break;
      default:
        p.logo = DefaultLogoIcon;
    }
  });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 2xl:gap-5 mb-3">
      {[...prices].map((element, idx) => (
        <div
          className="min-h-44 bg-slate-50 p-4 rounded-md border border-inherit"
          key={idx}
        >
          <div className="flex items-center">
            {element.logo}
            <span className="font-medium ml-2">{element.token}</span>
          </div>
          <div className="flex my-2">
            <span className="text-2xl font-medium">
              <span className="line-through ">W</span>
              <CountUp end={(element.data.price)} />
            </span>
            {element?.data?.dayChgRate ? (
              <div className="flex ml-5 items-center">
                {parseFloat(element?.data?.dayChgRate) > 0 ? (
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 1.66669L9.42091 6.91244C9.1569 7.17645 9.02489 7.30846 8.87267 7.35792C8.73878 7.40142 8.59455 7.40142 8.46065 7.35792C8.30843 7.30846 8.17643 7.17645 7.91241 6.91244L6.08757 5.0876C5.82356 4.82359 5.69156 4.69158 5.53934 4.64212C5.40544 4.59862 5.26121 4.59862 5.12732 4.64212C4.9751 4.69158 4.84309 4.82359 4.57908 5.0876L1.33333 8.33335M14.6667 1.66669H10M14.6667 1.66669V6.33335"
                      stroke="#18B368"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : parseFloat(element?.data?.dayChgRate) < 0 ? (
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 8.33335L9.42091 3.0876C9.1569 2.82359 9.02489 2.69158 8.87267 2.64212C8.73878 2.59862 8.59455 2.59862 8.46065 2.64212C8.30843 2.69158 8.17643 2.82359 7.91241 3.0876L6.08757 4.91244C5.82356 5.17645 5.69156 5.30846 5.53934 5.35792C5.40544 5.40142 5.26121 5.40142 5.12732 5.35792C4.9751 5.30846 4.84309 5.17645 4.57908 4.91244L1.33333 1.66669M14.6667 8.33335H10M14.6667 8.33335V3.66669"
                      stroke="#E62E2E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  ""
                )}
                {parseFloat(element?.data?.dayChgRate) > 0 ? (
                  <span className="text-green-600 ml-1">
                    {element?.data?.dayChgRate}%
                  </span>
                ) : parseFloat(element?.data?.dayChgRate) < 0 ? (
                  <span className="text-red-500 ml-1">
                    {element?.data?.dayChgRate}%
                  </span>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="text-black">
            <h2 className="text-lg font-medium mb-1">{text("p2p_company_wallet")}:</h2>
            {!isLoading ? (
              <div className="text-sm">
                {element.token === "POL" && (
                  <span>{`${formatNumberWithCommas(
                    P2PWalBalance?.pol,
                  ) ?? 0} POL`}</span>
                )}
                {element.token === "MSQ" && (
                  <span>{`${formatNumberWithCommas(
                    P2PWalBalance?.msq,
                  ) ?? 0} MSQ`}</span>
                )}
                {element.token === "MSQX" && (
                  <span>{`${formatNumberWithCommas(
                    P2PWalBalance?.msqx,
                  ) ?? 0} MSQX`}</span>
                )}
              </div>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default AdminPrices;
