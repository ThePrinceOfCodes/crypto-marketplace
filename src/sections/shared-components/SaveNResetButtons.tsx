import React, { Dispatch, SetStateAction } from "react";
import { useLocale } from "locale";
import ConfirmationDialog from "./ConfirmationDialog";

interface SaveNResetButtonsProps {
  saveHandler: () => void;
  resetHandler: () => void;
  openConfirmDialog?: boolean;
  setOpenConfirmDialog?: Dispatch<SetStateAction<boolean>>;
  onYesHandler?: () => void;
}

const SaveNResetButtons: React.FC<SaveNResetButtonsProps> = ({
  saveHandler,
  resetHandler,
  openConfirmDialog,
  setOpenConfirmDialog,
  onYesHandler,
}) => {
  const { text } = useLocale();
  return (
    <>
      {openConfirmDialog && setOpenConfirmDialog && onYesHandler && (
        <ConfirmationDialog
          openConfirmDialog={openConfirmDialog}
          setOpenConfirmDialog={setOpenConfirmDialog}
          onYesHandler={onYesHandler}
        />
      )}
      <button
        onClick={saveHandler}
        className="text-sm px-4 mr-1 ml-1 py-2.5 bg-blue-500 text-white rounded-md w-fit min-w-[127px] md:w-auto"
      >
        <span>{text("save_this_view")}</span>
      </button>
      <button
        onClick={resetHandler}
        className="text-sm px-4 py-2.5 border rounded-md w-fit min-w-[127px] md:w-auto"
      >
        <span>{text("reset_default")}</span>
      </button>
    </>
  );
};

export default SaveNResetButtons;
