import React from "react";
import {
  DialogContent,
  Box,
  IconButton,
} from "@mui/material";
import { useLocale } from "locale";
import Image from "next/image";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import { parseEkycData } from "@common/utils/helpers";

interface EkycModalProps {
  open: boolean;
  onClose: () => void;
  ekycData: string;
  faceRecognition: number | undefined;
}

const EkycModal: React.FC<EkycModalProps> = ({
  open,
  onClose,
  ekycData,
  faceRecognition,
}) => {
  const { text } = useLocale();

  const copyToClipboard = (textToCopy: any) => {
    navigator.clipboard.writeText(textToCopy);
    toast("Copied to clipoard.", { type: "success", autoClose: 1500 });
  };

  const parsedData = parseEkycData(ekycData);

  const finalData = {
    ekyc_data: parsedData,
    face_recognition: faceRecognition,
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("ekyc_title_modal_view_results")}
      maxWidth="sm"
    >
      <DialogContent>
        <pre className="text-sm text-grey-500 my-2">
          {JSON.stringify(finalData, null, 2)}
        </pre>
      </DialogContent>
      <Box className="flex items-center justify-end gap-2 mb-3 mr-3">
        <IconButton onClick={() => copyToClipboard(ekycData)} disabled={!ekycData} aria-label="copy icon">
          <Image
            className="cursor-pointer"
            alt=""
            width={17}
            height={17}
            src="/images/copy-icon.svg"
          />
        </IconButton>
      </Box>
    </CustomDialog>
  );
};

export default EkycModal;
