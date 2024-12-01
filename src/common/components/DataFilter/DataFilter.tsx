/* eslint-disable @typescript-eslint/no-unused-vars */
import useResponsive from "@common/hooks/useResponsive";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { DataFilterProps } from "./types";
import { FormControl, ListItemText, MenuItem, Select } from "@mui/material";
import { DatePicker } from "../DatePicker";
import { LocalKeys, useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { SearchBox } from "../SearchBox";
import dayjs from "dayjs";

const DATE_FILTER_OPTIONS = [
  {
    id: htmlIds.btn_data_filter_all,
    label: "reserved_vault_date_filter_all",
    value: "all",
  },
  {
    id: htmlIds.btn_data_filter_today,
    label: "reserved_vault_date_filter_today",
    value: "today",
  },
  {
    id: htmlIds.btn_data_filter_yesterday,
    label: "reserved_vault_date_filter_yesterday",
    value: "yesterday",
  },
  {
    id: htmlIds.btn_data_filter_1_week,
    label: "reserved_vault_date_filter_1_week",
    value: "1 week",
  },
  {
    id: htmlIds.btn_data_filter_1_month,
    label: "reserved_vault_date_filter_1_month",
    value: "1 month",
  },
  {
    id: htmlIds.btn_data_filter_3_months,
    label: "reserved_vault_date_filter_3_month",
    value: "3 months",
  },
];
const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

function DataFilter({
  onChange,
  statusOptions,
  statusOptions2,
  label,
  label2,
  dateFilterEnabled = true,
  selectStyle = {},
  flatPickerClass = "w-60",
  filterStatusId = htmlIds.select_data_filter_status,
  closeDrawerAction,
}: DataFilterProps) {
  const { text } = useLocale();
  const { isBigScreen } = useResponsive();
  const [range, setRange] = useState<Date[] | null>([]);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string | number | undefined>("all");
  const [usdtStatus, setUSDTStatus] = useState<string | number | undefined>(
    "all",
  );
  const firstRender = useRef(0);
  const debouncedSearchValue = useDebounce(
    search,
    1000,
    firstRender.current ? setStatus : () => {},
  );

  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    if (firstRender.current === 0) {
      const {
        usdt_status,
        status: _status,
        startDate,
        endDate,
        searchKey,
      } = query;

      if (searchKey && typeof searchKey === "string" && searchKey.trim()?.length)
        setSearch(searchKey);

      if (_status !== undefined && typeof _status === "string")
        setStatus(_status);
      if (usdt_status !== undefined) setUSDTStatus(usdt_status.toString());

      if (
        startDate &&
        endDate &&
        typeof startDate === "string" &&
        typeof endDate === "string"
      ) {
        setRange([
          dayjs(startDate).toDate(),
          dayjs(endDate).endOf("day").valueOf() as unknown as Date,
        ]);
      }

      firstRender.current = 1;
      return;
    }

    const getSearchKey = (firstRender: React.MutableRefObject<number>, search: string, debouncedSearchValue: string): string | undefined => {
      const trimmedSearch = search.trim();
      const trimmedDebouncedSearchValue = debouncedSearchValue.trim();

      if (firstRender.current < 2) {
        return trimmedSearch;
      } else {
        return trimmedDebouncedSearchValue;
      }
    };

    if (router.isReady) {
      onChange({
        ...query,
        status: status === "all" ? undefined : status,
        usdt_status: usdtStatus === "all" ? undefined : usdtStatus,
        searchKey: getSearchKey(firstRender, search, debouncedSearchValue),
        startDate: range?.[0]
          ? dayjs(range?.[0]).format("YYYY-MM-DDTHH:mm:ss.SSSZ").split("T")[0]
          : undefined,
        endDate: range?.[1]
          ? dayjs(range?.[1]).format("YYYY-MM-DDTHH:mm:ss.SSSZ").split("T")[0]
          : undefined,
      });
    }
    firstRender.current = 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchValue,
    onChange,
    range,
    status,
    usdtStatus,
    router.isReady,
  ]);

  // const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
  //   setSearch(event?.target.value);
  // };

  return (
    <div
      className={clsx(
        "flex",
        !isBigScreen ? "gap-5 flex-col px-4 pt-4 pb-1" : "gap-1",
      )}
    >
      {dateFilterEnabled && (
        <>
          {DATE_FILTER_OPTIONS.map((item) => {
            const _selected =
              getDateOptionFromDateRange(
                range?.[0] ? dayjs(range?.[0]) : undefined,
                range?.[1] ? dayjs(range?.[1]) : undefined,
              ) === item.value;

            return (
              <button
                id={item.id}
                key={item.value}
                onClick={(e) => {
                  e.stopPropagation();
                  const [from, to] = getStartAndEndDatesFromDateOption(
                    item.value,
                    [],
                  );
                  if (from && to) {
                    setRange([new Date(from), new Date(to)]);
                  } else {
                    setRange(null);
                  }
                  closeDrawerAction?.();
                }}
                className={clsx(
                  `flex items-center justify-center text-sm  h-10 ${
                    _selected ? "bg-blue-500 text-white" : "border"
                  } rounded-md`,
                  !isBigScreen ? "" : "w-[80px]",
                )}
              >
                <span>{text(item.label as LocalKeys)}</span>
              </button>
            );
          })}
          <DatePicker
            flatPickerClass={flatPickerClass}
            options={{ defaultDate: [new Date(), new Date()] }}
            value={range}
            onChange={(e: Date[]) => {
              if (e[0] && e[1]) {
                setRange([dayjs(e[0]).toDate(), dayjs(e[1]).toDate()]);
                closeDrawerAction?.();
              }
            }}
          />
          {/* <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              id={htmlIds.input_data_filter_search}
              type="search"
              value={search}
              onChange={handleSearch}
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder={text("platform_requests_search_placeholder")}
            />
          </div> */}
          <SearchBox value={search} onChangeFunc={setSearch} />
        </>
      )}
      {statusOptions && statusOptions?.length > 0 && (
        <FormControl
          className={`${isBigScreen ? "w-60" : "w-full"}`}
          style={{ ...selectStyle }}
        >
          <Select
            id={filterStatusId}
            className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={MenuProps}
            value={status as string}
            defaultValue={status as string}
            onChange={(e) => {
              setStatus(e.target.value);
              closeDrawerAction?.();
            }}
          >
            <MenuItem value="all">
              <em>{label ? label : text("data_filter_all_option")}</em>
            </MenuItem>
            {statusOptions.map((item) => {
              return (
                <MenuItem
                  className="text-xs"
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    id={item.label.split("_status_")[1]}
                    className={`text-xs ${item.className} truncate`}
                    primary={text(item.label as LocalKeys)}
                  />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}

      {statusOptions2 && statusOptions2?.length > 0 && (
        <FormControl
          className="truncate w-full md:w-60"
          style={{ ...selectStyle }}
        >
          <Select
            // id={filterStatusId}
            className="truncate bg-gray-50 h-10 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600  focus:border-primary-600"
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={MenuProps}
            value={usdtStatus as string}
            defaultValue={usdtStatus as string}
            onChange={(e) => {
              setUSDTStatus(e.target.value);
              closeDrawerAction?.();
            }}
          >
            <MenuItem value="all">
              <em>{label2 ? label2 : text("data_filter_all_option")}</em>
            </MenuItem>
            {statusOptions2?.map((item) => {
              return (
                <MenuItem
                  className="text-xs"
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    id={item.label.split("_status_")[1]}
                    className={`text-xs ${item.className} truncate`}
                    primary={text(item.label as LocalKeys)}
                  />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
    </div>
  );
}

export default DataFilter;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDebounce = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  delay: number,
  setStatus: (status: string | undefined) => void,
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
      // setStatus?.("all");
    }, delay);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);
  return debouncedValue;
};

function getDateOptionFromDateRange(
  startDate?: dayjs.Dayjs,
  endDate?: dayjs.Dayjs,
) {
  if (!startDate || !endDate) {
    return "all";
  }

  if (
    startDate.isSame(dayjs().startOf("day")) &&
    endDate.isSame(dayjs().endOf("day"))
  ) {
    return "today";
  } else if (
    startDate.isSame(dayjs().subtract(1, "day").startOf("day")) &&
    endDate.isSame(dayjs().subtract(1, "day").endOf("day"))
  ) {
    return "yesterday";
  } else if (
    startDate.isSame(dayjs().subtract(1, "week").startOf("day")) &&
    endDate.isSame(dayjs().endOf("day"))
  ) {
    return "1 week";
  } else if (
    startDate.isSame(dayjs().subtract(1, "month").startOf("day")) &&
    endDate.isSame(dayjs().endOf("day"))
  ) {
    return "1 month";
  } else if (
    startDate.isSame(dayjs().subtract(3, "months").startOf("day")) &&
    endDate.isSame(dayjs().endOf("day"))
  ) {
    return "3 months";
  }

  return "out-range";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStartAndEndDatesFromDateOption(filter: any, dates: any) {
  let startDate, endDate;
  switch (filter) {
    case "today":
      startDate = dayjs().startOf("day");
      endDate = dayjs().endOf("day");
      break;
    case "yesterday":
      startDate = dayjs().subtract(1, "day").startOf("day");
      endDate = dayjs().subtract(1, "day").endOf("day");
      break;
    case "1 week":
      startDate = dayjs().subtract(1, "week").startOf("day");
      endDate = dayjs().endOf("day");
      break;
    case "1 month":
      startDate = dayjs().subtract(1, "month").startOf("day");
      endDate = dayjs().endOf("day");
      break;
    case "3 months":
      startDate = dayjs().subtract(3, "months").startOf("day");
      endDate = dayjs().endOf("day");
      break;
    case "all":
      startDate = null;
      endDate = null;
      break;
    default:
      startDate = dates?.[0] ? dayjs(dates?.[0]) : null;
      endDate = dates?.[1] ? dayjs(dates?.[1]) : null;
  }

  return [startDate?.toISOString(), endDate?.toISOString()];
}
