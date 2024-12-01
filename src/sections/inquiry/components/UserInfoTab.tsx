import { useLocale } from "locale";
import { Box, Stack, Typography } from "@mui/material";

const readOnlyStyles = {
  border: "1px solid rgb(243 244 246)",
  padding: 1.2,
  minHeight: 42,
  borderRadius: 1,
  backgroundColor: "rgb(243 244 246)",
};

type IUserInfoTab = {
  userInfo:
    | {
        name: string;
        phone: string;
        email: string;
      }
    | undefined;
};

export default function UserInfoTab({ userInfo }: IUserInfoTab) {
  const { text } = useLocale();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}>
      <Stack spacing={1}>
        <Typography sx={{ color: "black" }}>
          {text("inquiry_page_column_username")}
        </Typography>
        <Typography sx={readOnlyStyles}>{userInfo?.name ?? ""}</Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography sx={{ color: "black" }}>
          {text("inquiry_page_column_email")}
        </Typography>
        <Typography sx={readOnlyStyles}>{userInfo?.email ?? ""}</Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography sx={{ color: "black" }}>
          {text("inquiry_page_column_phone")}
        </Typography>
        <Typography sx={readOnlyStyles}>{userInfo?.phone ?? "--"}</Typography>
      </Stack>
    </Box>
  );
}
