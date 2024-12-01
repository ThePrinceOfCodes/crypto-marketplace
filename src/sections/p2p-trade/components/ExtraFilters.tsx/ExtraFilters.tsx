import SelectField from "@common/components/FormInputs/SelectField";
import { FormControl, ListItemText, MenuItem } from "@mui/material";
import React, { useCallback } from "react";
import { htmlIds } from "@cypress/utils/ids";
import { LocalKeys, useLocale } from "locale";
import { useRouter } from "next/router";
import { P2POrderDataFilter } from "api/hooks";
import { DataFilterType } from "@common/components";

interface ExtraFiltersProps {
  isBuy: string;
  setIsBuy: (value: string) => void;
  onChange: (e: P2POrderDataFilter) => void;
}

const ExtraFilters = ({ isBuy, setIsBuy, onChange }: ExtraFiltersProps) => {
  const router = useRouter();
  const { text } = useLocale();

  const isBuyOptions = [
    { label: "p2p_is_buy_all", value: "all" },
    { label: "p2p_is_buy_true", value: "true" },
    { label: "p2p_is_buy_false", value: "false" },
  ];

  const MenuProps = {
    PaperProps: {
      style: {
        width: 120,
        borderRadius: 8,
      },
    },
  };

  const handleDataFilterChange = useCallback(
    (e: DataFilterType) => {
      onChange({
        ...router.query,
        ...e,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, router.query],
  );

  return (
    <FormControl className="mx-1 w-32 md:w-36">
      <SelectField
        variant="outlined"
        id={htmlIds.select_data_filter_status}
        className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
        inputProps={{ "aria-label": "Without label" }}
        MenuProps={MenuProps}
        value={isBuy}
        label={text("p2p_is_buy_label")}
        onChange={(e) => {
          setIsBuy(e.target.value as string);
          handleDataFilterChange({
            isBuy:
              e.target.value === "all" ? undefined : (e.target.value as string),
          });
        }}
      >
        {isBuyOptions.map((item) => {
          return (
            <MenuItem className="text-xs" key={item.value} value={item.value}>
              <ListItemText
                id={item.label.split("_buy_")[1]}
                className={"text-xs  truncate"}
                primary={text(item.label as LocalKeys)}
              />
            </MenuItem>
          );
        })}
      </SelectField>
    </FormControl>
  );
};

export default ExtraFilters;
