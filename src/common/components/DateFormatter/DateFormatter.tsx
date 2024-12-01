import { DateFormatterProps } from "./types";
import { formatDateAndTime } from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";

const DateFormatter = (props: DateFormatterProps) => {
  const { value, format, showZone, breakLine, showTime = true } = props;
  const { timezone } = useTimezone();
  if (!format && breakLine) {
    return (
      <>
        {formatDateAndTime(value, "YYYY-MM-DD", timezone, showZone)}
        {
          showTime &&
          <>
            <br />
            {formatDateAndTime(value, "HH:mm:ss", timezone, showZone)}
          </>
        }

      </>
    );
  }
  return <>{formatDateAndTime(value, format, timezone, showZone)}</>;
};

export default DateFormatter;
