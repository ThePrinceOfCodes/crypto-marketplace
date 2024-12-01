import { Box } from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { ViewBugReportModalRef } from "./types";
import { useLocale } from "locale";
import { isValidUrl } from "@common/utils/helpers";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

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
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("super_save_bug_report_modal_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="w-full max-w-lg bg-white max-h-full overflow-x-auto md:w-[465px]">
        <div className="flex flex-col justify-center">
          <p className="text-xs w-full bg-slate-50 border-2 rounded-lg py-3 px-2 whitespace-pre-wrap">
            {report.content}
          </p>
          <div className="pt-5 w-full flex justify-center items-center">
            {report?.image && isValidUrl(report?.image) && (
              <Image
                src={report.image}
                width={200}
                height={100}
                alt="bug_report_image"
              />
            )}
          </div>
          <Box sx={{ display: "flex", justifyContent: "center", rowGap: 2 }} >
            <FormFooter
              showCancelButton={false}
              onSubmit={onClose}
              submitText={text("view_commitment_information_ok")}
              sx={{ width: "144px" }}
            />
          </Box>
        </div>
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(ViewBugReportModal);
