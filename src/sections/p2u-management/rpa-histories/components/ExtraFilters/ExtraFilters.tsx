import SelectField from "@common/components/FormInputs/SelectField";
import { FormControl, ListItemText, MenuItem } from "@mui/material";
import React, { useCallback } from "react";
import { htmlIds } from "../../../../../../cypress/utils/ids";
import { LocalKeys, useLocale } from "locale";
import { useRouter } from "next/router";
import { UserRPAHistoryDataFilter } from "api/hooks";

const affiliateOptions = [
    { label: "data_filter_all_option", value: "all" },
    { label: "users_rpa_history_is_affiliated", value: "true" },
    { label: "users_rpa_history_is_not_affiliated", value: "false" },
];

const accumulateOptions = [
    { label: "data_filter_all_option", value: "all" },
    { label: "users_rpa_history_is_accumulated", value: "true" },
    { label: "users_rpa_history_is_not_accumulated", value: "false" },
];

interface Props {
    isAffiliated: string;
    isAccumulated: string;
    setIsAffiliated: (value: string) => void;
    setIsAccumulated: (value: string) => void;
    onChange: (e: UserRPAHistoryDataFilter) => void;
}

const ExtraFilters = ({ isAffiliated, isAccumulated, setIsAffiliated, setIsAccumulated, onChange }: Props) => {
    const router = useRouter();
    const { text } = useLocale();

    const MenuProps = {
        PaperProps: {
            style: {
                width: 120,
                borderRadius: 8,
            },
        },
    };

    const handleDataFilterChange = useCallback((e: UserRPAHistoryDataFilter) => {
        onChange({
            ...router.query,
            ...e,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onChange]);

    return (
        <>
            <FormControl className="mx-1 w-32 md:w-36">
                <SelectField
                    variant='outlined'
                    id={htmlIds.select_data_filter_status}
                    className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
                    inputProps={{ "aria-label": "Without label" }}
                    MenuProps={MenuProps}
                    value={isAffiliated}
                    label={text("change_affiliated_status")}
                    onChange={(e) => {
                        setIsAffiliated(e.target.value as string);
                        handleDataFilterChange({ is_affiliated: e.target.value === "all" ? undefined : e.target.value as string })
                    }}
                >
                    {affiliateOptions.map((item) => {
                        return (
                            <MenuItem
                                className="text-xs"
                                key={item.value}
                                value={item.value}
                            >
                                <ListItemText
                                    id={item.label.split("_status_")[1]}
                                    className={"text-xs  truncate"}
                                    primary={text(item.label as LocalKeys)}
                                />
                            </MenuItem>
                        );
                    })}
                </SelectField>
            </FormControl>


            <FormControl
                className="mx-1 w-32 md:w-36"
            >
                <SelectField
                    variant="outlined"
                    // id={filterStatusId}
                    className="truncate bg-gray-50 h-10 text-gray-900 text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
                    inputProps={{ "aria-label": "Without label" }}
                    MenuProps={MenuProps}
                    value={isAccumulated}
                    onChange={(e) => {
                        setIsAccumulated(e.target.value as string);
                        handleDataFilterChange({ is_accumulated: e.target.value === "all" ? undefined : e.target.value as string })
                    }}
                    label={text("change_accumulated_status")}
                >
                    {accumulateOptions.map((item) => {
                        return (
                            <MenuItem
                                className="text-xs"
                                key={item.value}
                                value={item.value}
                            >
                                <ListItemText
                                    id={item.label.split("_status_")[1]}
                                    className={"text-xs  truncate"}
                                    primary={text(item.label as LocalKeys)}
                                />
                            </MenuItem>
                        );
                    })}
                </SelectField>
            </FormControl>
        </>
    );
};

export default ExtraFilters;