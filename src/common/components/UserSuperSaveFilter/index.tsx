import React from "react";
import {
  FormControl,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import useResponsive from "@common/hooks/useResponsive";
import SelectField from "../FormInputs/SelectField";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

interface IUserSuperSaveFilter {
  value?: string;
  onChange?: (value: string) => void;
}

const UserSuperSaveFilter = (props: IUserSuperSaveFilter) => {
  const { value, onChange } = props;
  const { text } = useLocale();
  const { isBigScreen } = useResponsive();

  const filterOptions = [
    {
      label: text("user_super_save_without_restriction"),
      value: 0,
      className: "text-blue-500",
    },
    {
      label: text("user_super_save_with_restriction"),
      value: 1,
      className: "text-red-500",
    }
  ];

  return (
    <FormControl className={`${isBigScreen ? "w-60" : "w-full"}`}>
      <SelectField
        MenuProps={MenuProps}
        value={value}
        className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
        inputProps={{ "aria-label": "Without label" }}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value as string);
          }
        }}
        label={text("user_super_save_status")}
      >
        <MenuItem value="all">
          <em>{`${text("data_filter_all_option")} [${text(
            "data_filter_super_save",
          )}]`}</em>
        </MenuItem>
        {filterOptions.map((item) => {
          return (
            <MenuItem className="text-xs" key={item.value} value={item.value}>
              <ListItemText
                className={`text-xs ${item.className} truncate`}
                primary={text(item.label as LocalKeys)}
              />
            </MenuItem>
          );
        })}
      </SelectField>
    </FormControl>
  );
};

export default UserSuperSaveFilter;
