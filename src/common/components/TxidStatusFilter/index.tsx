import React from "react";
import {
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import useResponsive from "@common/hooks/useResponsive";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

interface ITxidStatusFilter {
  value?: string;
  onChange?: (value: string) => void;
}

const TxidStatusFilter = (props: ITxidStatusFilter) => {
  const { value, onChange } = props;
  const { text } = useLocale();
  

  const filterOptions = [
    {
      label: text("txid_management_status_option_waiting_return"),
      value: 0,
      className: "text-orange-500",
    },
    {
      label: text("txid_management_status_option_coin_returned"),
      value: 1,
      className: "text-green-500",
    },
    {
      label: text("txid_management_status_option_rejected"),
      value: 2,
      className: "text-red-500",
    },
  ];

  return (
    <FormControl className="truncate min-w-40 w-full md:w-40">
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
      </Select>
    </FormControl>
  );
};

export default TxidStatusFilter;
