import { Box, Modal } from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { ViewBugReportModalRef } from "./types";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";

function ViewBugReportModal(
  { report }: { report: { content: string; image: string | undefined } },
  ref: Ref<ViewBugReportModalRef>,
) {
  const [open, setOpen] = useState(false);
  const { text } = useLocale();

  const onClose = () => {
    setOpen(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="justify-center items-center flex"
    >
      <Box className="w-full max-w-lg bg-white rounded-xl px-5 py-9 shadow-md max-h-full overflow-x-auto">
        <div className="flex flex-col justify-center">
          <div className="flex flex-row justify-between">
            <span>{text("super_save_bug_report_modal_title")}</span>
            <Image
              className="cursor-pointer"
              width={30}
              height={30}
              src={"/images/cancel.svg"}
              alt={"Cancel Icon"}
              onClick={onClose}
            />
          </div>
          <p className="mt-5 text-xs w-full bg-slate-50 border-2 rounded-lg py-3 px-2 whitespace-pre-wrap">
            {report.content}
          </p>
          <div className="pt-5 w-full flex justify-center items-center">
            {report.image && (
              <Image
                src={report.image}
                width={200}
                height={100}
                alt="bug_report_image"
              />
            )}
          </div>
          <div className="flex mt-3 gap-2 justify-center">
            <button
              onClick={onClose}
              className="ml-1 mt-5 group rounded-md border border-transparent bg-blue-600 py-2 w-28 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id={htmlIds.btn_alert_dialog_ok}
            >
              {text("super_save_bug_report_modal_ok")}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default forwardRef(ViewBugReportModal);
