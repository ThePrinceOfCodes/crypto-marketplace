import { useMemo } from "react";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { Grid, Box, Card, Typography } from "@mui/material";
import { sharedColDef } from "@common/utils/sharedColDef";
import { GridColDef } from "@mui/x-data-grid";
import { customisedTableClasses } from "@common/constants/classes";
import { useLocale } from "locale";
import { useP2UTablesExport } from "@common/hooks";
import ExportButton from "./ExportButton";
import Chart from "./Chart";
import { Spinner } from "@common/components";

interface Props {
  loading: boolean;
  rowData: {
    city: string;
    store_count: number;
    platform_id: string;
  }[];
}

const AffiliatedStoreByCity = ({ loading, rowData }: Props) => {
  const { text } = useLocale();
  const { storeByCityDownload } = useP2UTablesExport();

  const columns: GridColDef[] = [
    {
      ...sharedColDef,
      field: "no",
      headerName: text("affiliate_store_column_header_no"),
    },
    {
      ...sharedColDef,
      field: "city",
      headerName: text("affiliate_store_by_category_column_header_city"),
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
    if (!rowData) return [];

    return rowData
      .filter(({ store_count }) => store_count > 0)
      .sort((a, b) => b.store_count - a.store_count)
      .slice(0, 4)
      .map((data, id) => ({
        id,
        value: data.store_count,
        label: data.city,
      }));
  }, [rowData]);

  return (
    <Box sx={{ boxShadow: 1, padding: 2, borderRadius: 1 }}>
      <Typography variant="h6" fontWeight={500} marginBottom={2}>
        {text("affliate_store_by_city")}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Box height={300}>
            <DataGridPro
              hideFooter
              columns={columns}
              rows={rows}
              getRowId={(row) => row.city}
              sx={customisedTableClasses}
              components={{
                Toolbar: () => (
                  <ExportButton
                    disabled={rows.length === 0}
                    onClick={() => storeByCityDownload(rows)}
                  />
                ),
              }}
              loading={loading}
            />
          </Box>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card variant="outlined">
            <Box height={300}>
              {loading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner size={8} />
                </div>
              ) : (
                <Chart
                data={pieChartData}
                chartName={text("affliate_store_by_city")}
                chartHeight={250}
              />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AffiliatedStoreByCity;
