import { GridColDef } from "@mui/x-data-grid";
import { sharedColDef } from "@common/utils/sharedColDef";
import { DateFormatter } from "@common/components";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useLocale } from "locale";
import { useCopyToClipboard } from "@common/utils/helpers";
import { CommunityObject } from "api/hooks/community/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMemo } from "react";

type Interface = {
  handleUpdateCommunity: (args: CommunityObject) => void;
  handleDeleteCommunity: (args: CommunityObject) => void;
  deleteData: number;
};

const useCommunityCols = ({
  handleUpdateCommunity,
  handleDeleteCommunity,
  deleteData,
}: Interface) => {
  const { text } = useLocale();
  const copyToClipboard = useCopyToClipboard();

  const WithCopyIcon = ({ value }: { value: string }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Typography variant="body2">{value}</Typography>
      <Tooltip title={text("platform_copy")}>
        <IconButton size="medium" onClick={() => copyToClipboard(value)}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const CommunityColumns: GridColDef[] =  useMemo(
    () => [
    {
      ...sharedColDef,
      field: "no",
      headerName: text("community_status_page_column_no"),
      minWidth: 80,
    },
    {
      ...sharedColDef,
      field: "country",
      headerName: `${text("community_header_country")}`,
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "name",
      headerName: `${text("community_header_name")}`,
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "email",
      headerName: `${text("community_header_email")}`,
      minWidth: 250,
      renderCell: ({ row: { email } }) => <WithCopyIcon value={email} />,
    },
    {
      ...sharedColDef,
      field: "phone_number",
      headerName: `${text("community_header_phone_number")}`,
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "representative",
      headerName: `${text("community_header_representative")}`,
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "referral_code",
      headerName: `${text("community_header_referral_code")}`,
      minWidth: 200,
      renderCell: ({ row: { referral_code } }) => (
        <WithCopyIcon value={referral_code} />
      ),
    },
    {
      ...sharedColDef,
      field: "created_by",
      headerName: `${text("community_header_created_by")}`,
      minWidth: 200,
    },
    {
      ...sharedColDef,
      field: "createdAt",
      headerName: `${text("community_header_created_at")}`,
      minWidth: 200,
      renderCell: ({ value }) => value && <DateFormatter value={value} />,
    },
    {
      ...sharedColDef,
      field: "updatedAt",
      headerName: `${text("community_header_updated_at")}`,
      minWidth: 200,
      renderCell: ({ value }) => value && <DateFormatter value={value} />,
    },
    {
      ...sharedColDef,
      field: "actions",
      headerAlign: "center",
      headerName: `${text("community_header_actions")}`,
      minWidth: 100,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {[
            {
              label: text("platform_edit"),
              icon: EditIcon,
              onClick: handleUpdateCommunity,
            },
            {
              label: text("platform_delete"),
              icon: DeleteIcon,
              onClick: handleDeleteCommunity,
            },
          ].map(({ label, icon: Icon, onClick }, index) => (
            <Tooltip title={label} key={label}>
              <IconButton
                onClick={() => {
                  onClick(row);
                }}
                disabled={index === 1 && deleteData > 1}
              >
                <Icon color={index === 0 ? "success" : "error"} />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      ),
    },
  ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  [text]
);

  return { CommunityColumns };
};

export default useCommunityCols;
