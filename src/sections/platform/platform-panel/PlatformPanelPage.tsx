import React from "react";
import { Divider } from "@mui/material";
import { useGetDashboardStatistics } from "api/hooks";
import { useLocale } from "locale";

function PlatformPanelPage() {
  const getListQuery = useGetDashboardStatistics();
  const { data } = getListQuery;
  const { text } = useLocale()

  return (
    <>
      <div className="flex h-main-screen overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-6 py-6 w-full max-w-9xl mx-auto">
          <div className="w-full mb-5 pb-5 tokens-header">
            <h4 className="text-2xl font-medium">{text("platforms_panel_page_title")}</h4>
            <span className="text-slate-500 text-sm">
              {text("platforms_panel_page_description")}
            </span>
          </div>
          <main>
            <div className="py-2 w-full max-w-9xl mx-auto">
              <div className="platforms-info popinText flex	h-28	w-full bg-slate-50 items-center	p-6 rounded-lg">
                <div className="item flex flex-col w-1/3">
                  <span className="text-sm	text-slate-500 pb-3">
                    {text("platforms_panel_page_platforms_connected")}
                  </span>
                  <span className="text-2xl">{data?.nPlatforms || 0}</span>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="item flex flex-col ml-3 w-1/3">
                  <span className="text-sm	text-slate-500 pb-3">
                    {text("platforms_panel_page_no_of_requests_on_platforms")}
                  </span>
                  <span className="text-2xl">{data?.nRequests || 0}</span>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="item flex flex-col ml-3 w-1/3">
                  <span className="text-sm	text-slate-500 pb-3">
                    {text("platforms_panel_page_no_of_transactions")}
                  </span>
                  <span className="text-2xl">{data?.nTransactions || 0}</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default PlatformPanelPage;
