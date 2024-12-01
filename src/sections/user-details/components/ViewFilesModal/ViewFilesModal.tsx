import { Spinner } from "@common/components";
import { useLocale } from "locale";
import {
  Box,
  DialogActions,
} from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import dynamic from "next/dynamic";
import CustomDialog from "@common/components/CustomDialog";
import { CustomImage } from "@common/components/CustomImage";
const PDFView = dynamic(() => import("./components/PDFView/PDFView"), {
  ssr: false,
});

export type ViewFilesModalRef = {
  open: () => void;
};

function ViewFilesModal(
  { files }: { files: { file_name: string; file_url?: string }[] },
  ref: Ref<ViewFilesModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const onClose = () => {
    setOpen(false);
  };

  const downloadFiles = async () => {
    try {
      setLoading(true);
      await Promise.all(
        files.map(async (item) => {
          if (item.file_url) {
            const baseUrl = process.env.API_BASE_URL ?? "";
            const url = baseUrl.includes("dev")
              ? `https://dev-static.msq.market/${item.file_url.split("/")[3]}`
              : baseUrl.includes("stg")
                ? `https://stg-static.msq.market/${item.file_url.split("/")[3]}`
                : `https://static.msq.market/${item.file_url.split("/")[3]}`;

            const apiUrl = `/api/download?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
              throw new Error("Failed to fetch the file from API");
            }

            const blob = await response.blob();
            const urlObject = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = urlObject;
            link.download = `${item.file_name}.${item.file_url.split(".").pop()}`;
            link.click();
            URL.revokeObjectURL(urlObject);
          }
        })
      );
    } catch (error) {
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("users_view_files_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[500px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        {files.map(
          (item) =>
            item.file_url &&
            (item.file_url.endsWith(".pdf") ? (
              <PDFView file={item.file_url} key={item.file_name} />
            ) : (
              <CustomImage
                src={item.file_url}
                width={500}
                height={400}
                alt={item.file_name}
                key={item.file_name}
                className="h-auto  object-cover"
              />
            )),
        )}
        
        <DialogActions className="flex justify-center">
          <button
            className="mr-1 rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={downloadFiles}
            disabled={loading}
          >
            {loading && <Spinner />}
            {text("users_view_files_downdload_files")}
          </button>
          <button
            onClick={onClose}
            className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {text("users_view_files_ok")}
          </button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(ViewFilesModal);
