import { LocalKeys, useLocale } from "locale";
import { arrayToString } from "@common/utils/helpers";
import { MostSpentInterface } from "api/hooks/P2UDashboard";
import { formatDate } from "@cypress/utils/converters";
import { usePostAdminHistoryLog } from "api/hooks";
import { jsonToExcelDownload } from "@common/utils/excelutil";

export const useP2UTablesExport = () => {
  const { text } = useLocale();
  const { mutateAsync: postAdminHistoryLog } = usePostAdminHistoryLog();

  const df = (fileName: string) =>
    postAdminHistoryLog({
      content_en: "Excel Download",
      content_kr: "Excel Download",
      uuid: arrayToString([
        text(fileName as LocalKeys),
        formatDate(new Date()) + ".xlsx",
      ]),
    });

  const dn = (fileName: string) => {
    return `${arrayToString([
      text(fileName as LocalKeys),
      formatDate(new Date(), false),
    ])}`;
  };

  const affiliatedStoresDownload = (data: MostSpentInterface[]) => {
    jsonToExcelDownload(
      data.map((item) => ({
        [text("affliate_store_by_category_column_header_name")]: item.name,
        [text("affiliate_store_by_category_column_header_city")]: item.city,
        [text("affiliate_store_by_category_column_header_address")]:
          item.address,
        [text("affiliate_store_by_category_column_header_code")]: item.code,
        [text("affiliate_store_by_category_column_header_location_lat")]:
          item.location_lat,
        [text("affiliate_store_by_category_column_header_location_long")]:
          item.location_long,
        [text("affiliate_store_by_category_column_store_details")]:
          item.store_details,
        [text("affiliate_store_by_category_column_balance")]: item.balance,
      })),

      dn("affliate_stores"),
    );

    df("affliate_stores");
  };

  const storeByCityDownload = (
    data: { city: string; store_count: number; platform_id: string }[],
  ) => {
    jsonToExcelDownload(
      data.map((item) => ({
        [text("affiliate_store_by_category_column_header_city")]: item.city,
        [text("affiliate_store_by_city_column_store_count")]: item.store_count,
      })),
      dn("affliate_store_by_city"),
    );

    df("affliate_store_by_city");
  };

  const storeByCategoryDownload = (
    data: { category: string; store_count: number; platform_id: string }[],
  ) => {
    jsonToExcelDownload(
      data.map((item) => ({
        [text("affiliate_store_by_category_column_header_category")]:
          item.category,
        [text("affiliate_store_by_city_column_store_count")]: item.store_count,
      })),
      dn("affliate_store_by_category"),
    );
    df("affliate_store_by_category");
  };

  return {
    affiliatedStoresDownload,
    storeByCityDownload,
    storeByCategoryDownload,
  };
};
