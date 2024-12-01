/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataFilter, DataFilterProps, DataFilterType } from "@common/components";
import useResponsive from "@common/hooks/useResponsive";
import CloseIcon from "@common/icons/CloseIcon";
import { Divider, Drawer } from "@mui/material";
import clsx from "clsx";
import { useLocale } from "locale";
import styles from "./styles.module.css";
import UserSuperTrustFilter from "../UserSuperTrustFilter";
import { UserCommunityFilter } from "../UserCommunityFilter";
import { useRouter } from "next/router";
import { UserCreditSalePermissionFilter } from "../UserCreditSalePermissionFilter";
import UserSuperSaveFilter from "../UserSuperSaveFilter";
import { useEffect, useState } from "react";

const DataFilterWrapper = ({
  data = [],
  className = "border-b pb-3 flex space-x-1",
  filterMobileDrawerOpen,
  setFilterMobileDrawerOpen,
  onSuperTrustChange,
  onSuperSaveChange,
  onCommunityChange,
  onCreditSalePermission,
  isUserScreen = false,
  isDepositScreen = false,
}: {
  data: DataFilterProps[];
  className?: string;
  filterMobileDrawerOpen: boolean;
  setFilterMobileDrawerOpen: (open: boolean) => void;
  onSuperTrustChange?: (value: string) => void;
  onSuperSaveChange?: (value: string) => void;
  onCommunityChange?: (value: string) => void;
  onCreditSalePermission?: (value: string[]) => void;
  isUserScreen?: boolean;
  isDepositScreen?: boolean;
}) => {
  const { isBigScreen } = useResponsive();
  const { text } = useLocale();

  const query = useRouter().query;
  const closeDrawerAction = () => {
    setFilterMobileDrawerOpen(false);
  };

  const superSave =  query?.super_save_restriction as string;
  const superTrust =  query?.super_trust_status as string;
  const community =  query?.super_save_community ?? query?.community;
  const creditSalePermission = typeof query?.credit_sale_permission === "string" ? [query?.credit_sale_permission] : query?.credit_sale_permission;

  if (!isBigScreen)
    return (
      <Drawer open={filterMobileDrawerOpen} onClose={closeDrawerAction}>
        <div className={"flex flex-col md:w-[300px] md:items-center h-[100%]"}>
          <div
            className={
              "!h-[8.5%] flex w-full justify-start items-center pl-6 md:pl-12 space-x-4"
            }
          >
            <div onClick={closeDrawerAction}>
              <CloseIcon />
            </div>
            <span className={styles["filter-title"]}>
              {text("date_filter_title")}
            </span>
          </div>

          <Divider />
          <div
            className={clsx(
              styles["mobile-sidebar-body"],
              "flex flex-col w-[80vw] md:px-2 pb-10 md:w-[260px] pt-2",
            )}
          >
            {data?.map((obj, idx) => {
              return (
                <DataFilter
                  key={idx}
                  label={obj.label}
                  label2={obj.label2}
                  statusOptions={obj.statusOptions}
                  statusOptions2={obj.statusOptions2}
                  onChange={obj.onChange}
                  selectStyle={obj.selectStyle}
                  flatPickerClass={obj.flatPickerClass}
                  dateFilterEnabled={obj.dateFilterEnabled}
                  filterStatusId={obj.filterStatusId}
                  closeDrawerAction={closeDrawerAction}
                />
              );
            })}
            {onSuperSaveChange && isUserScreen && (
              <div
                className={clsx(
                  "flex",
                  !isBigScreen ? "gap-5 flex-col px-4 pt-4 pb-1" : "gap-1",
                )}
              >
                <UserSuperSaveFilter value={superSave} onChange={onSuperSaveChange} />
              </div>
            )}
            {onSuperTrustChange && isUserScreen && (
              <div
                className={clsx(
                  "flex",
                  !isBigScreen ? "gap-5 flex-col px-4 pt-4 pb-1" : "gap-1",
                )}
              >
                <UserSuperTrustFilter value={superTrust} onChange={onSuperTrustChange} />
              </div>
            )}
            {onCommunityChange && (isUserScreen || isDepositScreen) && (
              <div
                className={clsx(
                  "flex",
                  !isBigScreen ? "gap-5 flex-col px-4 pt-4 pb-1" : "gap-1",
                )}
              >
                <UserCommunityFilter value={community as string || "all"} onChange={onCommunityChange} />
              </div>
            )}
            {onCreditSalePermission && isDepositScreen && (
              <div
                className={clsx(
                  "flex",
                  !isBigScreen ? "gap-5 flex-col px-4 pt-4 pb-1" : "gap-1",
                )}
              >
                <UserCreditSalePermissionFilter value={creditSalePermission as string[] || []} onChange={onCreditSalePermission} />
              </div>
            )}
          </div>
        </div>
      </Drawer>
    );

  return (
    <div className={className}>
      {data?.map((obj, idx) => {
        return (
          <DataFilter
            key={idx}
            label={obj.label}
            label2={obj.label2}
            statusOptions={obj.statusOptions}
            statusOptions2={obj.statusOptions2}
            onChange={obj.onChange}
            selectStyle={obj.selectStyle}
            flatPickerClass={obj.flatPickerClass}
            dateFilterEnabled={obj.dateFilterEnabled}
            filterStatusId={obj.filterStatusId}
          />
        );
      })}
      {onSuperSaveChange && (
        <div className="w-full">
          <UserSuperSaveFilter value={superSave} onChange={onSuperSaveChange} />
        </div>
      )}
      {onSuperTrustChange && (
        <div className="w-full">
          <UserSuperTrustFilter value={superTrust} onChange={onSuperTrustChange} />
        </div>
      )}
      {
        onCommunityChange && (
          <div>
            <UserCommunityFilter onChange={onCommunityChange} value={community as string || "all"} />
          </div>
        )
      }
      {
        onCreditSalePermission && (
          <div>
            <UserCreditSalePermissionFilter onChange={onCreditSalePermission} value={creditSalePermission as string[] || []} />
          </div>
        )
      }
    </div>
  );
};

export default DataFilterWrapper;
