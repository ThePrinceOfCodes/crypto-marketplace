import { Box, Modal } from "@mui/material";
import React, { forwardRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "locale";

function ComingSoonModal() {
  const [open, setOpen] = useState(true);
  const { text } = useLocale();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="justify-center items-center flex"
    >
      <Box className="w-full max-w-lg bg-white rounded-xl px-5 py-9 shadow-md">
        <div className="flex flex-col items-center">
          <div className="flex flex-row w-full justify-between">
            <div />
            <span className="font-extrabold">{text("coming_soon")}</span>
            <Image
              className="cursor-pointer"
              width={30}
              height={30}
              src={"/images/cancel.svg"}
              alt={"Cancel Icon"}
              onClick={onClose}
            />
          </div>
          <p className="mt-5 text-sm">{text("coming_soon_detail")}</p>
        </div>
      </Box>
    </Modal>
  );
}

export default forwardRef(ComingSoonModal);
