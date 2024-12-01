import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { PreviewCertificateModalRef } from "./types";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import CustomDialog from "@common/components/CustomDialog";

function PreviewCertificateModal(
  { url, type }: { url: string; type: string },
  ref: Ref<PreviewCertificateModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

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

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={
        type === "KRW"
          ? text("reserved_vault_bank_certificate")
          : text("add_reserved_vault_transaction_certification")
      }
    >
      <div className="flex justify-center contain object-contain">
        <Image
          id={htmlIds.img_reserved_vault_preview_certificate_modal_certificate}
          alt="certificate"
          src={url}
          width={400}
          height={400}
          className="h-[400px] object-cover"
        />
      </div>
    </CustomDialog>
  );
}

export default forwardRef(PreviewCertificateModal);
