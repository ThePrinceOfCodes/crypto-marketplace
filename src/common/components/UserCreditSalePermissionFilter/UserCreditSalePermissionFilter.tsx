import React, { useEffect } from "react";
import {
  FormControl,
  ListItemText,
  MenuItem,
  Checkbox
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

interface IUserCreditSalePermissionFilter {
  value: string[];
  onChange?: (value: string[]) => void;
}

const UserCreditSalePermissionFilter = (props: IUserCreditSalePermissionFilter) => {
  const { value, onChange } = props;
  const { text } = useLocale();
  const { isBigScreen } = useResponsive();

  const filterOptions = [
    {
      label: text("deposit_information_filter_all_credit_sale_permission"),
      value: "all",
    },
    {
      label: text("deposit_information_filter_credit_sale_auto_manual"),
      value: "credit_sale",
    },
    {
      label: text("deposit_information_filter_credit_sale_auto"),
      value: "credit_sale_auto",
    },
    {
      label: text("deposit_information_filter_credit_sale_manual"),
      value: "credit_sale_manual",
    },
    {
      label: text("deposit_information_filter_super_save_old_new"),
      value: "super_save",
    },
    {
      label: text("deposit_information_filter_super_save_old"),
      value: "super_save_old",
    },
    {
      label: text("deposit_information_filter_super_save_new"),
      value: "super_save_new",
    },
  ];

  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([]);

  useEffect(() => {
    if (value) {
      setSelectedLabels(typeof value === "string"
        ? [filterOptions.find((item) => item.value === value)?.label].filter((label): label is string => label !== undefined)
        : value?.map((v) => filterOptions.find((item) => item.value === v)?.label).filter((label): label is string => label !== undefined) || []);
    }
  }, [value]);

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;
    // if the last value is "All" set the selected labels to ["All"]
    if ((value[value.length - 1]) === "All") {
      setSelectedLabels(["All"]);
      if (onChange) {
        onChange(["all"]);
      }
    } else {
      // if the value length is equal to the filterOptions length - 1 , this means all the values are selected except "All", so set the selected labels to ["All"]
      if (value.length === filterOptions.length - 1) {
        setSelectedLabels(["All"]);
        if (onChange) {
          onChange(["all"]);
        }
        return;
      }
      // filter out the "All" value and set the selected labels to the filtered values
      setSelectedLabels(value.filter((v: string) => v !== "All"));
      if (onChange) {
        onChange(value.map((v: string) => {
          const value = filterOptions.find((f) => f.label === v)?.value as string;
          return value;
        }).filter((v: string) => !!v));
      }
    }
  };


  return (
    <FormControl className={`${isBigScreen ? "w-60" : "w-full"}`}>
      <SelectField
        MenuProps={MenuProps}
        variant="outlined"
        multiple={true}
        value={selectedLabels}
        className="truncate bg-gray-50 h-10  text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
        inputProps={{ "aria-label": "Without label" }}
        onChange={handleChange}
        label={text("select_credit_sale_permission")}
        renderValue={(selected: any) => {
          if (selected?.length === 0) {
            return <em className="text-6ray-500">{text("select_credit_sale_permission")}</em>;
          }
          return selected?.join(', ');
        }}
      >
        {filterOptions.map((item) => {
          return (
            <MenuItem
              selected={!!selectedLabels?.find((v) => v === item.label)}
              className="text-xs text-gray-900" key={item.value} value={item.label}>
              <Checkbox
                checked={!!selectedLabels?.find((v) => v === item.label)}
              />
              <ListItemText
                className={"text-xs text-gray-600 truncate"}
                primary={text(item.label as LocalKeys)}
              />
            </MenuItem>
          );
        })}
      </SelectField>
    </FormControl>
  );
};

export default UserCreditSalePermissionFilter;
