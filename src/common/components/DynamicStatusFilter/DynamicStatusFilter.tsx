import React from "react";
import {
  FormControl,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

interface IDynamicStatusFilter {
  value?: string;
  onChange?: (value: string) => void;
  options: {
    label: string;
    value: string | number;
    className: string;
  }[];
}

const DynamicStatusFilter = (props: IDynamicStatusFilter) => {
  const { value, onChange, options } = props;
  const { text } = useLocale();

  return (
    <FormControl className="truncate w-full md:w-40 xl:min-w-40">
      <Select
        MenuProps={MenuProps}
        value={value}
        className="truncate bg-gray-50 h-10  text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
        inputProps={{ "aria-label": "Without label" }}
        defaultValue={"all"}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value);
          }
        }}
      >
        <MenuItem value="all">
          <em>{`${text("data_filter_all_option")}`}</em>
        </MenuItem>
        {options.map((item) => {
          return (
            <MenuItem className="text-xs" key={item.value} value={item.value}>
              <ListItemText
                className={`text-xs ${item.className} truncate`}
                primary={text(item.label as LocalKeys)}
              />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default DynamicStatusFilter;
