import { useState } from "react";
import {
  useGetAffiliatedDashboard,
  ResponseInterface,
} from "api/hooks/P2UDashboard";
import {
  P2UStoresDisplay,
  AffiliatedStores,
  AffiliatedStoreByCity,
  AffiliatedStoresByCategory,
} from "./Components";
import { Box } from "@mui/material";

type Interface = {
  platform_id: string;
};

const PDDashboardPanel = ({ platform_id }: Interface) => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [dashboardData, setDashboardData] = useState<ResponseInterface>();

  const {
    countMonth,
    countWeek,
    countToday,
    countByCity,
    countByCategory,
    mostSpent,
  } = dashboardData || {};

  const { isLoading } = useGetAffiliatedDashboard(
    {
      page,
      limit,
      platform_id,
    },
    {
      onSuccess: (response: ResponseInterface) => {
        setDashboardData(response);
      },
    },
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
      <AffiliatedStores
        loading={isLoading}
        countMonth={countMonth}
        countWeek={countWeek}
        countToday={countToday}
      />

      <AffiliatedStoreByCity rowData={countByCity ?? []} loading={isLoading} />

      <AffiliatedStoresByCategory
        rowData={countByCategory ?? []}
        loading={isLoading}
      />

      <P2UStoresDisplay
        rowData={mostSpent?.rows ?? []}
        count={mostSpent?.count ?? 0}
        loading={isLoading}
        page={page}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        platform_id={platform_id}
      />
    </Box>
  );
};

export default PDDashboardPanel;
