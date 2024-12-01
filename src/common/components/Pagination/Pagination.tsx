import useResponsive from "@common/hooks/useResponsive";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import {
  ListItemText,
  Pagination as MPagination,
  MenuItem,
  Select,
} from "@mui/material";
import { PaginationProps } from "./types";
import { LocalKeys, useLocale } from "locale";
import { useDialog } from "@common/context";
import { isNumber } from "lodash";
import { htmlIds } from "@cypress/utils/ids";
import SelectField from "../FormInputs/SelectField";

const MenuProps = {
  PaperProps: {
    style: {
      width: 240,
      borderRadius: 8,
    },
  },
};

const sortOptions = [
  {
    label: "deposit_information_sort_on",
    value: "on",
  },
  {
    label: "deposit_information_sort_off",
    value: "off",
  }
];

function Pagination(props: PaginationProps) {
  const {
    page,
    totalPages,
    initialPage,
    onChangePage,
    onChangeLimit,
    limit,
    limits,
    defaultLimit,
    isFetching,
    id = "",
    viewSort = "on",
    setViewSort,
    serverSideSorting = false,
  } = props;
  const { text } = useLocale();
  const { isMobile } = useResponsive();
  const { alertDialog } = useDialog();
  const [_page, set_page] = useState(initialPage || 1);
  const [pageInput, setPageInput] = useState<number | string>();
  const [_limit, set_limit] = useState(defaultLimit || 25);
  const [_totalPages, _setTotalPages] = useState(totalPages);
  const [isChangeLimit, setIsChangeLimit] = useState<boolean>(false);

  const finalPage = page || _page;
  const finalSetPage = onChangePage || set_page;
  const finalLimit = limit || _limit;
  const finalSetLimit = onChangeLimit || set_limit;

  const handleChangePageInput = (v: string) => {
    if (!v) {
      setPageInput("");
      return;
    }
    const cleanedValue = v.replace(/[^\d]/g, "");
    const clampedValue = Math.max(Number(cleanedValue), 1);
    setPageInput(clampedValue);
  };

  const handleKeyPress = (key: string) => {
    if (key === "Enter" && isNumber(pageInput)) {
      if (_totalPages && pageInput > _totalPages) {
        alertDialog({
          title: text("pagination_page_input_validation"),
        });
      } else {
        finalSetPage(Number(pageInput));
      }
      setPageInput("");
    }
  };

  // useEffect(() => {
  //   finalSetPage(1);
  // }, [finalLimit, finalSetPage]);

  useEffect(() => {
    if (totalPages !== undefined) {
      _setTotalPages(totalPages);
    }
  }, [totalPages]);

  useEffect(() => {
    if (isChangeLimit && !isFetching) setIsChangeLimit(false);
  }, [isChangeLimit, isFetching]);

  if (
    _totalPages === 0 ||
    _totalPages === undefined ||
    totalPages === undefined
  ) {
    return null;
  }
  return (
    <div
      id={htmlIds.div_pagination_container}
      className="flex text-nowrap flex-col gap-5 justify-between items-center lg:flex-row  lg:gap-2 py-2"
    >
      <div />
      <div
        className={clsx(
          "flex items-center gap-2",
          isMobile ? "flex-col gap-5" : "",
        )}
      >
        <MPagination
          count={_totalPages}
          page={finalPage}
          size={isMobile ? "small" : "large"}
          onChange={(_, v) => finalSetPage(v)}
        />
        {_totalPages > 7 && (
          <div className="flex items-center gap-1">
            <span className="text-neutral-700">
              {text("pagination_page_input_text_1")}
            </span>
            <input
              className="border rounded-md w-14 h-7 px-2 outline-none focus:border-blue-400 duration-200 text-sm"
              value={pageInput}
              onChange={(e) => handleChangePageInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e.key)}
              placeholder={`1-${_totalPages}`}
            />
            <span className="text-neutral-700">
              {text("pagination_page_input_text_2")}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div>
          <SelectField
            className="bg-gray-50 h-7 w-32 text-gray-900 sm:text-xs text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600"
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={MenuProps}
            value={viewSort}
            onChange={setViewSort ? (e) => setViewSort(e.target.value as string) : undefined}
            label={text("deposit_information_view_sort")}
            disabled={!serverSideSorting}
          >
            <MenuItem disabled value="unselected">
              <em>{text("deposit_information_view_sort")}</em>
            </MenuItem>
            {sortOptions.map((item) => {
              return (
                <MenuItem
                  className="text-xs text-neutral-500"
                  key={item.value}
                  value={item.value}
                >
                  <ListItemText
                    className="text-xs"
                    primary={text(item.label as LocalKeys)}
                  />
                </MenuItem>
              );
            })}
          </SelectField>
        </div>
        {!!limits?.length && (
          <Select
            id={id + "_" + htmlIds.select_pagination_limit}
            className="border rounded-md w-32 h-7 outline-none focus:border-blue-400 duration-200 text-sm"
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={MenuProps}
            value={finalLimit}
            defaultValue={finalLimit}
            onChange={(e) => {
              finalSetLimit(e.target.value as number);
              finalSetPage(1);
              setIsChangeLimit(true);
              _setTotalPages(1);
            }}
          >
            {limits.map((item) => {
              return (
                <MenuItem className="text-sm" key={item} value={item}>
                  <ListItemText
                    className={"text-sm"}
                    primary={`${item} / ${text("pagination_limit_prefix")}`}
                  />
                </MenuItem>
              );
            })}
          </Select>
        )}
      </div>
    </div>
  );
}

export default Pagination;
