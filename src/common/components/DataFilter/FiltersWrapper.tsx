import useResponsive from "@common/hooks/useResponsive";
import { FilterButton } from "../FilterButton";
import { use, useCallback, useEffect, useState } from "react";
import DataFilterWrapper from "./DataFilterWrapper";
import { useLocale } from "locale";
import DataFilter from "./DataFilter";
import { DataFilterType } from "@common/components";
import { useRouter } from "next/router";

type FiltersWrapperType = {
  handleDataFilterChange: (e: DataFilterType) => void;
  isUserScreen?: boolean;
  isDepositScreen?: boolean;
};

const statusOptions = [
  { label: "users_status_not_applicable", value: 3 },
  { label: "users_status_approved", value: 1, className: "text-blue-500" },
  { label: "users_denial_of_approval", value: 2, className: "text-yellow-500" },
  {
    label: "users_column_header_waiting_for_approval",
    value: 0,
    className: "text-green-500",
  },
];

export default function FiltersWrapper({
  handleDataFilterChange: handleDataFilterChangeProps,
  isUserScreen = false,
  isDepositScreen = false,
}: FiltersWrapperType) {
  const { text } = useLocale();
  const { isBigScreen } = useResponsive();
  const [filterMobileDrawerOpen, setFilterMobileDrawerOpen] =
    useState<boolean>(false);

  const router = useRouter();

  const handleDataFilterChange = useCallback((e: DataFilterType) => {
    if (router.isReady) {
      router.push({
        pathname: router.pathname,
        query: {
          ...Object.fromEntries(
            Object.entries({
              ...router.query,
              ...e,
            }).filter(
              // eslint-disable-next-line
              ([_, v]) => v !== undefined && v !== null && v.length !== 0,
            ),
          ),
        },
      });
    }
    handleDataFilterChangeProps(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleDataFilterChangeProps]);

  useEffect(() => {
    if (router.isReady) {
      handleDataFilterChange(router.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleDataFilterChange, router.isReady]);

  const DataFilterOptions = {
    label: `${text("data_filter_all_option")} [${text(
      "korean_currency_name",
    )}]`,
    statusOptions: statusOptions,
    label2: `${text("data_filter_all_option")} [${text(
      "global_currency_name",
    )}]`,
    statusOptions2: statusOptions,
    onChange: handleDataFilterChange,
    selectStyle: isBigScreen ? {} : { width: "100%" },
    flatPickerClass: "w-40 3xl:w-60",
  };

  const DataFilterOptions2 = {
    label: `${text("data_filter_all_option")} [${text(
      "korean_currency_name",
    )}]`,
    statusOptions: [],
    label2: `${text("data_filter_all_option")} [${text(
      "global_currency_name",
    )}]`,
    statusOptions2: [],
    onChange: handleDataFilterChange,
    selectStyle: isBigScreen ? {} : { width: "100%" },
    flatPickerClass: "w-40 3xl:w-60",
  };

  return (
    <>
      {!isBigScreen && (
        <div className={"flex justify-end"}>
          <FilterButton onClick={() => setFilterMobileDrawerOpen(true)} />
        </div>
      )}

      {!isBigScreen && isUserScreen && (
        <div className="gap-5 flex-col">
          <DataFilterWrapper
            filterMobileDrawerOpen={filterMobileDrawerOpen}
            setFilterMobileDrawerOpen={setFilterMobileDrawerOpen}
            data={[DataFilterOptions]}
            onSuperSaveChange={(value) =>
              handleDataFilterChange({ super_save_restriction: value })
            }
            onSuperTrustChange={(value) =>
              handleDataFilterChange({ super_trust_status: value })
            }
            onCommunityChange={(value) =>
              handleDataFilterChange({ super_save_community: value })
            }
            isUserScreen={isUserScreen}
            isDepositScreen={isDepositScreen}

          />
        </div>
      )}

      {!isBigScreen && !isUserScreen && (
        <div className="gap-5 flex-col">
          <DataFilterWrapper
            filterMobileDrawerOpen={filterMobileDrawerOpen}
            setFilterMobileDrawerOpen={setFilterMobileDrawerOpen}
            data={[DataFilterOptions2]}
            onSuperTrustChange={(value) =>
              handleDataFilterChange({ super_trust_status: value })
            }
            isUserScreen={isUserScreen}
          />
        </div>
      )}

      {isBigScreen && !isUserScreen && (
        <div className="pb-3">
          <DataFilter onChange={handleDataFilterChange} />
        </div>
      )}

      {isBigScreen && (isUserScreen || isDepositScreen) && (
        <DataFilterWrapper
          filterMobileDrawerOpen={filterMobileDrawerOpen}
          setFilterMobileDrawerOpen={setFilterMobileDrawerOpen}
          data={[DataFilterOptions]}
          onSuperTrustChange={(value) =>
            handleDataFilterChange({ super_trust_status: value })
          }
          onCommunityChange={(value) =>
            handleDataFilterChange({ super_save_community: value })
          }
          onSuperSaveChange={(value) =>
            handleDataFilterChange({ super_save_restriction: value })
          }
        />
      )}
    </>
  );
}

