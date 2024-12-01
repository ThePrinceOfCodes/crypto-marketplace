import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { offsetAbbreviationMap } from "@common/components/DateFormatter/timezoneAbbrev";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
export const EMAIL_PATTERN = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const formatDate = (
  date: string | Date | undefined,
  time = false,
  dateFormat = "YYYY-MM-DD",
) => {
  if (!date) return date;
  const timeString = time ? " HH:mm:ss" : "";
  return dayjs(date).format(`${dateFormat}${timeString}`);
};

export const formatNumberWithCommas = (
  number: number | undefined,
  fraction = 1,
  decimals?: number | undefined,
): string | undefined => {
  if (number === undefined) return number;
  const formatter = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fraction,
    minimumFractionDigits: decimals,
  });
  return formatter.format(number);
};

export const getTimezoneAbbr = (timezone: string) => {
  return offsetAbbreviationMap[timezone];
};

export const formatDateAndTime = (
  date: string | Date | undefined,
  format = "YYYY-MM-DD HH:mm:ss",
  timezone = "Asia/Seoul",
  showZone = false,
) => {
  if (!date) return date;
  const parsedDateTime = dayjs(date);
  if (!parsedDateTime.isValid()) {
    return date;
  }
  const koreanDate = dayjs.tz(date, "Asia/Seoul");

  const formattedDate = koreanDate.tz(timezone).format(format);
  if (showZone) {
    const timezoneOffset = koreanDate.tz(timezone).format("z");
    const timezoneAbbreviation = getTimezoneAbbr(timezone) || timezoneOffset;
    const finalFormattedDate = `${formattedDate} ${timezoneAbbreviation}`;
    return finalFormattedDate;
  }
  return formattedDate;
};

export const convertToHHMMSS = (timeString: string) => {
  if(!timeString) return timeString;
  const hours = timeString.substring(0, 2);
  const minutes = timeString.substring(2, 4);
  const seconds = timeString.substring(4, 6);

  return hours + ":" + minutes + ":" + seconds;
};

export const convertToYYYYMMDD = (dateString: string) => {
  if(!dateString) return dateString;
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  return year + "-" + month + "-" + day;
};
