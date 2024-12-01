import { useMemo } from "react";
import { customisedTableClasses } from "@common/constants/classes";
import { Typography, Box, Grid, Card } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { sharedColDef } from "@common/utils/sharedColDef";
import { GridColDef } from "@mui/x-data-grid";
import { useLocale } from "locale";
import { useP2UTablesExport } from "@common/hooks";
import ExportButton from "./ExportButton";
import useResponsive from "@common/hooks/useResponsive";
import Chart from "./Chart";
import { Spinner } from "@common/components";

interface Props {
  loading: boolean;
  rowData: Array<{
    category: string;
    store_count: number;
    platform_id: string;
  }>;
}

const AffiliatedStoresByCategory = ({ loading, rowData }: Props) => {
  const { text } = useLocale();
  const { isMobile } = useResponsive();
  const { storeByCategoryDownload } = useP2UTablesExport();

  const columns: GridColDef[] = [
    {
      ...sharedColDef,
      field: "no",
      headerName: text("affiliate_store_column_header_no"),
    },
    {
      ...sharedColDef,
      field: "category",
      headerName: text("affiliate_store_by_category_column_header_category"),
    },
    {
      ...sharedColDef,
      field: "store_count",
      headerName: text("affiliate_store_by_city_column_store_count"),
    },
  ];

  const rows = useMemo(() => {
    return rowData.map((data, index) => ({
      ...data,
      no: index + 1,
    }));
  }, [rowData]);

  const pieChartData = useMemo(() => {
    return rowData
      .filter(({ store_count }) => store_count > 0)
      .sort((a, b) => b.store_count - a.store_count)
      .slice(0, 4)
      .map((data, id) => ({
        id,
        value: data.store_count,
        label: data.category,
      }));
  }, [rowData]);

  const components = [
    {
      name: "Chart",
      Component: () => (
        <Grid item xs={12} lg={4}>
          <Card variant="outlined">
            <Box height={300} className="m-2">
              {loading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner size={8} />
                </div>
              ) : (
                <Chart
                data={pieChartData}
                chartName={text("affliate_store_by_category")}
                chartHeight={250}
              />
              )}
            </Box>
          </Card>
        </Grid>
      ),
    },
    {
      name: "grid",
      Component: () => (
        <Grid item xs={12} lg={8}>
          <Box height={300}>
            <DataGridPro
              hideFooter
              columns={columns}
              rows={rows}
              getRowId={(row) => row.category}
              sx={customisedTableClasses}
              loading={loading}
              components={{
                Toolbar: () => (
                  <ExportButton
                    disabled={rows.length === 0}
                    onClick={() => storeByCategoryDownload(rows)}
                  />
                ),
              }}
            />
          </Box>
        </Grid>
      ),
    },
  ];

  return (
    <Box sx={{ boxShadow: 1, padding: 2, borderRadius: 1 }}>
      <Typography variant="h6" fontWeight={500} marginBottom={2}>
        {text("affliate_store_by_category")}
      </Typography>
      <Grid container spacing={4}>
        {(isMobile ? components.toReversed() : components).map(
          ({ Component, name }) => (
            <Component key={name} />
          ),
        )}
      </Grid>
    </Box>
  );
};

export default AffiliatedStoresByCategory;
