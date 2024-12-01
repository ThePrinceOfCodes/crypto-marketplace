import { useContext } from "react";
import { Divider, Stack, IconButton } from "@mui/material";
import {
  AdminPrices,
  AdminTransactionsChart,
  AdminRequestsChart,
} from "./components";
import { useGetDashboardStatistics } from "api/hooks";
import { useLocale } from "locale";
import { Spinner } from "@common/components";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { dashboardSteps } from "@common/constants/onboardingSteps";
import { OnboardingContext } from "@common/context";

function AdminDashboard() {
  const { text } = useLocale();
  const { setPage, setSteps } = useContext(OnboardingContext);

  const getListQuery = useGetDashboardStatistics();
  const { data, isLoading } = getListQuery;

  const onHelpRequest = () => {
    setPage("dashboard");
    setSteps(dashboardSteps);
  };

  return (
    <>
      {/*<div className="">*/}
      {/*  /!* Sidebar *!/*/}
      {/*  /!* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> *!/*/}

      {/*  /!* Content area *!/*/}
      <div className="relative flex flex-col ">
        {/*  Site header */}
        {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

        <main>
          <div className="px-4 sm:px-6 lg:px-6 py-6 w-full max-w-9xl mx-auto">
            <div className="w-full mb-5 pb-5 tokens-header">
              <Stack direction="row" alignItems="center">
                <h4 className="text-2xl font-medium">{text("dashboard")}</h4>
                <IconButton onClick={onHelpRequest} aria-label="help">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <span className="text-slate-500 text-sm">
                {text("dashboard_detail")}
              </span>
            </div>
            {/* Prices */}
            <AdminPrices />

            {/* Cards */}
            <div className="flex pt-2 flex-col xl:flex-row space-y-5 xl:space-y-0 pb-3 xl:pb-3 w-[100%]">
              <AdminTransactionsChart />
              <AdminRequestsChart />
            </div>

            <div className="py-2 w-full max-w-9xl mx-auto">
              <div className="pb-4 w-full max-w-9xl mx-auto block md:hidden">
                <div className="platforms-info popinText flex	h-28	w-full bg-white items-center	p-6 rounded-lg border border-inherit">
                  <div className="item flex flex-col w-[100%]">
                    <span className="text-sm	text-slate-500 pb-3">
                      {text("requests_on_platforms")}
                    </span>
                    <span className="text-2xl">
                      {isLoading ? (
                        <Spinner size={6} />
                      ) : (
                        data?.data?.nRequests || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="platforms-info popinText flex	h-28	w-full bg-white items-center	p-6 rounded-lg border border-inherit">
                <div className="item flex flex-col w-1/2 md:w-1/3">
                  <span className="text-sm pr-1	text-slate-500 pb-3">
                    {text("platform_connected")}
                  </span>
                  <span className="text-2xl">
                    {isLoading ? (
                      <Spinner size={6} />
                    ) : (
                      data?.data?.nPlatforms || 0
                    )}
                  </span>
                </div>

                <Divider
                  orientation="vertical"
                  flexItem
                  className="hidden md:flex"
                />
                <div className="item hidden md:flex flex-col ml-3 w-1/3">
                  <span className="text-sm	text-slate-500 pb-3">
                    {text("requests_on_platforms")}
                  </span>
                  <span className="text-2xl">
                    {isLoading ? (
                      <Spinner size={6} />
                    ) : (
                      data?.data?.nRequests || 0
                    )}
                  </span>
                </div>

                <Divider orientation="vertical" flexItem />
                <div className="item flex flex-col ml-3 w-1/2 md:w-1/3">
                  <span className="text-sm	text-slate-500 pb-3">
                    {text("no_of_transactions")}
                  </span>
                  <span className="text-2xl">
                    {isLoading ? (
                      <Spinner size={6} />
                    ) : (
                      data?.data?.nTransactions || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* <Banner /> */}
      </div>
      {/*</div>*/}
    </>
  );
}

export default AdminDashboard;
