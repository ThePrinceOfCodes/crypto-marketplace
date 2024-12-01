import React, { useState } from "react";
import {
  Box,
  OutlinedInput,
  InputAdornment,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useLocale } from "locale";
import { GridRowId } from "@mui/x-data-grid-pro";
import useResponsive from "@common/hooks/useResponsive";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DateRangePicker from "@common/components/DateRangePicker";
import { DateValueType } from "react-tailwindcss-datepicker";
import CommunityRewardDialoge from "./CommunityRewardDialoge";

type HeaderInterface = {
  setSearchKey: (key: string) => void;
  onAdd: () => void;
  onDelete: () => void;
  setDates: (args: DateValueType) => void;
  dates: DateValueType;
  setLastId: React.Dispatch<React.SetStateAction<string | undefined>>;
  deleteData: Array<GridRowId>;
};

const Header = ({
  setSearchKey,
  onAdd,
  onDelete,
  deleteData,
  setLastId,
  setDates,
  dates,
}: HeaderInterface) => {
  const { isMobile, isTabletOrMobile } = useResponsive();
  const { text } = useLocale();

  const [openCommunityCronSettings, setOpenCommunityCronSettings] =
    useState(false);

  const handlecommunityCronSettings = () => {
    setOpenCommunityCronSettings(true);
  };

  return (
    <>
      <CommunityRewardDialoge
        open={openCommunityCronSettings}
        handleClose={() => setOpenCommunityCronSettings(false)}
      />
      <Box>
        <Typography sx={{ fontSize: "24px" }}>
          {text("community_title")}
        </Typography>
        <Typography variant="body1" sx={{ color: "rgb(100, 116, 139)" }}>
          {text("community_header_sub_title")}
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: isTabletOrMobile ? "end" : "center",
          justifyContent: "space-between",
          flexDirection: isTabletOrMobile ? "column" : "row",
          rowGap: isTabletOrMobile ? 2 : 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            columnGap: 2,
            flexDirection: isMobile ? "column" : "row",
            width: "100%",
            rowGap: isMobile ? 2 : 0,
            paddingRight: isTabletOrMobile ? 0 : 2,
          }}
        >
          <OutlinedInput
            placeholder={text("platform_requests_search_placeholder")}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            sx={{
              "& .MuiInputBase-input:focus": {
                boxShadow: "none",
              },
              width: isMobile ? "100%" : 300,
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setLastId(undefined);
              setSearchKey(event.target.value);
             }
            }
          />

          <DateRangePicker
            value={dates as DateValueType}
            onChange={(val: DateValueType) => {
              setLastId(undefined);
              setDates(val);
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            columnGap: 2,
            alignItems: "center",
            width: "100%",
          }}
        >
          <button
            onClick={handlecommunityCronSettings}
            className={`flex items-center justify-center text-sm px-4 py-2 disabled:bg-transparent disabled:text-neutral-100 disabled:cursor-not-allowed border border-gray-400 text-black rounded-md
            }`}
          >
            {text("community_reward_settings")}
          </button>
          <Button
            onClick={onDelete}
            startIcon={<DeleteIcon />}
            variant="contained"
            disableElevation
            color="error"
            disabled={deleteData.length < 2}
            size="large"
          >
            {text("community_mass_delete")}
          </Button>

          <Button
            onClick={onAdd}
            startIcon={<AddIcon />}
            variant="contained"
            disableElevation
          >
            {text("community_add_new")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Header;
