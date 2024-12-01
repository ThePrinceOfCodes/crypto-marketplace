import { useState } from "react";
import { Typography, Box, Avatar } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { customisedTableClasses } from "@common/constants/classes";
import { formatNumberWithCommas } from "@common/utils/formatters";
import { sharedColDef } from "@common/utils/sharedColDef";
import { GridColDef } from "@mui/x-data-grid";
import { Pagination } from "@common/components";
import {
  ResponseInterface,
  MostSpentInterface,
  useGetMassMostSpent,
} from "api/hooks/P2UDashboard";
import { useP2UTablesExport } from "@common/hooks";
import { useLocale } from "locale";
import ExportButton from "./ExportButton";

interface Props {
  loading: boolean;
  page: number;
  limit: number;
  count: number;
  platform_id: string;
  rowData: Array<MostSpentInterface>;
  setLimit: (arg: number) => void;
  setPage: (arg: number) => void;
}
const P2UStoresDisplay = ({
  loading,
  rowData,
  page,
  limit,
  count,
  setPage,
  setLimit,
  platform_id,
}: Props) => {
  const { text } = useLocale();
  const [isLoading, setIsLoading] = useState<boolean>();

  const columns: GridColDef[] = [
    {
      ...sharedColDef,
      field: "name",
      headerName: text("affliate_store_by_category_column_header_name"),
      minWidth: 300,
      renderCell: ({ row: { name, image_url } }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            columnGap: 2,
          }}
        >
          <Avatar src={image_url} alt="" />
          <Typography variant="body2">{name}</Typography>
        </Box>
      ),
    },
    {
      ...sharedColDef,
      field: "code",
      headerName: text("affiliate_store_by_category_column_header_code"),
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "city",
      headerName: text("affiliate_store_by_category_column_header_city"),
      minWidth: 150,
    },
    {
      ...sharedColDef,
      field: "address",
      headerName: text("affiliate_store_by_category_column_header_address"),
      minWidth: 200,
    },
    /* {
      ...sharedColDef,
      field: "location_lat",
      headerName: text(
        "affiliate_store_by_category_column_header_location_lat",
      ),
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "location_long",
      headerName: text(
        "affiliate_store_by_category_column_header_location_long",
      ),
      minWidth: 200,
    }, */
    {
      ...sharedColDef,
      field: "store_details",
      headerName: text("affiliate_store_by_category_column_store_details"),
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "balance",
      headerName: text("affiliate_store_by_category_column_balance"),
      minWidth: 150,
      renderCell: ({ value }) => {
        return <div>
          {formatNumberWithCommas(value)}{" "}{text("deposit_information_krw_suffix")}
        </div>;
      },
    },
  ];

  const { affiliatedStoresDownload } = useP2UTablesExport();

  const { mutateAsync: massDownload } = useGetMassMostSpent();

  const handleExcelDownload = () => {
    setIsLoading(true);
    massDownload(
      { platform_id },
      {
        onSuccess: ({ mostSpent: { rows } }: ResponseInterface) => {
          affiliatedStoresDownload(rows);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <Box sx={{ boxShadow: 1, padding: 2, borderRadius: 1 }}>
      <Typography variant="h6" fontWeight={500} marginBottom={2}>
        {text("affliate_stores")}
      </Typography>
      <DataGridPro
        hideFooter
        columns={columns}
        rows={rowData}
        getRowId={(row) => row.code}
        sx={customisedTableClasses}
        loading={loading}
        autoHeight
        components={{
          Toolbar: () => (
            <ExportButton
              disabled={rowData.length === 0}
              onClick={handleExcelDownload}
              loading={isLoading}
            />
          ),
        }}
      />

      <Pagination
        isFetching={loading}
        page={page}
        limit={limit}
        totalPages={Math.ceil(count / limit)}
        limits={[5, 10, 25, 50, 75, 100]}
        onChangeLimit={(limit: number) => setLimit(limit)}
        onChangePage={(page: number) => setPage(page)}
      />
    </Box>
  );
};

export default P2UStoresDisplay;
