import React, { useEffect } from "react";
import {
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import useResponsive from "@common/hooks/useResponsive";
import { useGetCommunityListByAdmin } from "api/hooks";
import { useAuth } from "@common/context";
import SelectField from "../FormInputs/SelectField";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

interface IUserCommunityFilter {
  value?: string;
  onChange?: (value: string) => void;
}

const UserCommunityFilter = (props: IUserCommunityFilter) => {
  const { value, onChange } = props;
  const { text } = useLocale();
  const { user } = useAuth();
  const { isBigScreen } = useResponsive();

  const { data, mutateAsync: getCommunityLists } = useGetCommunityListByAdmin();

  useEffect(() => {
    if (!user) return;
    getCommunityLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isBigScreen]);

  return (
    <FormControl className={`${isBigScreen ? "w-60" : "w-full"}`}>
      <SelectField
        MenuProps={MenuProps}
        variant="outlined"
        value={value}
        className="truncate bg-gray-50 h-10  text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
        inputProps={{ "aria-label": "Without label" }}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value as string);
          }
        }}
        label={text("select_community")}
      >
        <MenuItem value="all">
          <em>{`${text("data_filter_all_option")}`}</em>
        </MenuItem>
        {data?.communityListData?.map((item) => {
          return (
            <MenuItem className="text-xs" key={item.name} value={item.name}>
              <ListItemText
                className={"text-xs truncate"}
                primary={text(item.name as LocalKeys)}
              />
            </MenuItem>
          );
        })}
      </SelectField>
    </FormControl>
  );
};

export default UserCommunityFilter;
