import resolveConfig from "tailwindcss/resolveConfig";
import _tailwindConfig from "../../../tailwind.config";
import { toast } from "react-toastify";
import { LocalKeys, useLocale } from "locale";
import { IDepositRequest, ISuperUserDetail } from "../../api/hooks";
import { formatNumberWithCommas } from "./formatters";
import { IntroducerInfoObj } from "@sections/super-save/deposit-information/components/CheckIntroducerInfoModal/CheckIntroducerInfoModal";
import dayjs from "dayjs";

export const tailwindConfig = () => {
  // Tailwind config
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return resolveConfig(_tailwindConfig);
};

export const formatValue = (value: number) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

export const calculateTimeDiff = (
  a = "00:00",
  b = "00:00",
  hoursText = "hours",
  minutesText = "minutes",
) => {
  if (a?.length === 4) a = 0 + a;
  else if (b?.length === 4) b = 0 + b;

  // Parse the time strings into Date objects
  const timeA = new Date("1970-01-01T" + a + ":00");
  const timeB = new Date("1970-01-01T" + b + ":00");

  // Calculate the time difference in milliseconds
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const diffMs = timeB - timeA;

  // Calculate the difference in hours and minutes
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // if (diffHours > 0 && diffMinutes > 0) return diffHours + 'hours' + ' ' + diffMinutes + 'minutes'
  // else return '0'
  return "(" + diffHours + hoursText + " " + diffMinutes + minutesText + ")";
};

const MAX_CELL_TEXT_LENGTH = 32767;

const truncateLongText = (text: string): string => {
  if (text.length > MAX_CELL_TEXT_LENGTH) {
    return text.substring(0, MAX_CELL_TEXT_LENGTH);
  }
  return text;
};

export const useCopyToClipboard = () => {
  const { text } = useLocale();

  const copyToClipboard = (textToCopy: string, toastMessage?: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text((toastMessage || "copy_to_clipboard_message") as LocalKeys), {
      type: "success",
      autoClose: 1500,
    });
  };
  return copyToClipboard;
};

export const inViewport = (element: Element) => {
  if (!element) return false;
  if (1 !== element.nodeType) return false;

  const html = document.documentElement;
  const rect = element.getBoundingClientRect();

  return (
    !!rect &&
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.left <= html.clientWidth &&
    rect.top <= html.clientHeight
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayToString = (ara: any, separate = " ") => ara.join(separate);

export const truncateString = (str: string, maxLength: number) =>
  str.length > maxLength ? str.slice(0, maxLength) + "..." : str;

export const isSuperSaveUser = (userDetails: ISuperUserDetail | undefined) =>
  userDetails?.status === 1 || userDetails?.usdt_status === 1;

export const getLocalStorageState = (key: string) => {
  const state = localStorage.getItem(key);
  const parse = state ? JSON.parse(state) : null;
  return parse;
};

export const determineRequestType = (
  row: {
    credit_sale_permission: IDepositRequest["credit_sale_permission"];
    super_save_count: IDepositRequest["super_save_count"];
    created_by: IDepositRequest["created_by"];
    community_permission: IDepositRequest["community_permission"];
  },
  text: (id: LocalKeys) => string,
) => {
  if (row.credit_sale_permission === 0) {
    if (row.super_save_count === 0) {
      return text("deposit_information_request_type_super_save_new");
    } else if (row.super_save_count && row.super_save_count > 0) {
      return text("deposit_information_request_type_super_save_old");
    } else {
      return text("deposit_information_request_type_super_save");
    }
  } else if (row.credit_sale_permission === 1) {
    if (row.community_permission == 1) {
      return text("deposit_information_request_type_credit_sale_community");
    } else if (row.created_by === "System") {
      return text("deposit_information_request_type_credit_sale_auto");
    } else {
      return text("deposit_information_request_type_credit_sale_manual");
    }
  } else {
    return "---";
  }
};

const checkAppDisplayTokenAmount = (row: {
  credit_sale_permission: IDepositRequest["credit_sale_permission"];
  desosit_amout_in_msq: IDepositRequest["desosit_amout_in_msq"];
}) => {
  if (row.credit_sale_permission === 0) {
    return Math.ceil(row.desosit_amout_in_msq / 2);
  } else if (row.credit_sale_permission === 1) {
    return row.desosit_amout_in_msq;
  } else {
    return undefined;
  }
};

export const determineAppDisplayTokenAmount = (
  row: IDepositRequest,
  creditSaleDecimalPlace: number,
) => {
  const { credit_sale_permission, desosit_amout_in_msq, deposit_token } = row;
  const appAmount = checkAppDisplayTokenAmount({
    credit_sale_permission,
    desosit_amout_in_msq,
  });
  if (appAmount === undefined) {
    return "---";
  }
  return `${formatNumberWithCommas(
    appAmount,
    creditSaleDecimalPlace,
    creditSaleDecimalPlace,
  )} ${deposit_token}`;
};

export const showSortingPageNotification = (msg:string) => {
  toast(msg, {
    type: "warning",
  });
};

export const isValidJSON = (jsonString: string) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export const extractPathFromUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  return parsedUrl.pathname;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resetMUIToolbarFilter = (apiRef: any) => {
  apiRef.current.setFilterModel({
    items: [],
  });
};

export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function matchesUrlPattern(url: string) {
  const urlPattern = /^https:\/\/(?:[a-z0-9]{8}\.msq-link\.pages\.dev|msq\.link)\/[a-z0-9]{6}$/;
  return urlPattern.test(url);
}

export function getErrorMessage(err: any): string {
  // Check for general message error
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  // Miscellaneous error occurred
  return "Miscellaneous error occurred. Please try again.";
}

export const checkImageSize = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any,
  sizeLimit = 10 * 1024 * 1024,
  errorMessage = "Image size is too large",
) => {
  if (image && image.size > sizeLimit) {
    toast(`${errorMessage}`, { type: "error" });
    return false;
  }
  return true;
};

export const parseIntroducerInfo = (
  value: string | null | undefined,
): IntroducerInfoObj[] => {
  if (value && value !== "") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Error parsing introducer_info:", error);
    }
  }

  return JSON.parse("[]") as unknown as IntroducerInfoObj[];
};

export const handleMinMaxDate = <T extends { [key: string]: any }>(
  name: string,
  values: T,
) => {
  let min;
  let max;

  if (name === "endDate") {
    min = dayjs(values["startDate"]);
  }

  if (name === "startDate") {
    max = dayjs(values["endDate"]);
  }

  return { min, max };
};


export function parseEkycData(ekycData: any): any {
  let parsedData;

  if (ekycData && typeof ekycData === "string") {
    try {
      parsedData = JSON.parse(ekycData);
    } catch (error) {
      console.error("Parsing error:", error);
    }
  } else {
    console.error("Invalid ekycData:", ekycData);
  }

  return parsedData;
}
export const scrollToTop = () => {
    document
      .querySelector(".MuiDataGrid-virtualScroller")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };
