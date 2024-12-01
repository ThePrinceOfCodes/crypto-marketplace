import React from "react";
import { formatDateAndTime } from "@common/utils/formatters";
import { useTimezone } from "@common/hooks";
import { IGetAdminLogActivityUsers } from "api/hooks";

type Props = {
  row: IGetAdminLogActivityUsers;
};

const DetailPanel: React.FC<Props> = ({ row }) => {
  const { timezone } = useTimezone();
  const { content } = row;

  const parsedContent = JSON.parse(content);
  const dataChangedLogs = parsedContent?.dataChangedLogs;
  const oldValues = dataChangedLogs[0]?.oldValues;
  const newValues = dataChangedLogs[0]?.newValues;
  const actionType = parsedContent?.logType;
  const { ...otherRecord } = dataChangedLogs?.[0] || [];

  const createdAT = formatDateAndTime(
    row.createdAt,
    "DD/MM/YYYY HH:mm:ss",
    timezone,
  );

  const formatValues = (values: {
    title: string;
    created_at: string;
    content: string;
  }) => ({
    title: values?.title,
    created_at: createdAT,
    content: values?.content,
  });
  const formattedOldValues = formatValues(oldValues);
  const formattedNewValues = formatValues(newValues);
  return (
    <div className="p-4">
      {actionType === "update" ? (
        <>
          <p className="text-red-400 mb-2">
            Record: {JSON.stringify(formattedOldValues)}
          </p>
          <p className="text-green-600">
            Changed to: {JSON.stringify(formattedNewValues)}
          </p>
        </>
      ) : (
        <p
          className={`${
            actionType === "delete" ? "text-red-400" : "text-green-600"
          }`}
        >
          Record: {JSON.stringify({ created_at: createdAT, ...otherRecord })}
        </p>
      )}
    </div>
  );
};

export default DetailPanel;
