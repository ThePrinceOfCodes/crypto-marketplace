import { useAuth } from "@common/context";
import { PlatformPanelPage } from "../platform";
import { AdminDashboard } from "../admin";
import React from "react";

function Dashboard() {
  const { hasAuth, loading, isAuthenticated } = useAuth();

  if (isAuthenticated && !loading) {
    if (hasAuth('platform.show')) {
      return <AdminDashboard />;
    } else {
      return <PlatformPanelPage />;
    }
  }
}

export default Dashboard;
