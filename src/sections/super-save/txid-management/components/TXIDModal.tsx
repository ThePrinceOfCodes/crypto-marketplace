import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Box } from "@mui/material";
import { useLocale, LocalKeys } from "locale";
import { Spinner } from "@common/components";
import { ITxidDataObject } from "./TxidUpdateModal/types";
import { useVerifyTxid } from "api/hooks/txid-history";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";

type iTXIDModal = {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: () => void) => void;
  data: ITxidDataObject[];
  setAddNewTXIDData: Dispatch<SetStateAction<ITxidDataObject[]>>;
  loading: boolean;
  isEditMode: boolean;
};

export default function TXIDModal({
  open,
  onClose,
  onSubmit,
  data,
  setAddNewTXIDData,
  loading,
  isEditMode,
}: iTXIDModal) {
  const { text } = useLocale();

  const [enteredTxid, setEnteredTxid] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [txidFieldValue, setTXIDFieldValue] = useState<null | string>(null);
  const [txidFieldError, setTXIDFieldError] = useState<boolean>(false);

  const {
    isLoading: isVerifying,
    data: exists,
    refetch: verifyAgain,
    isRefetching: isReverifying,
  } = useVerifyTxid(enteredTxid == "" ? "." : enteredTxid);

  useEffect(() => {
    if (isTxid(enteredTxid)) {
      if (exists) {
        setValidationMessage("Duplicated");
      } else {
        setValidationMessage("Not Duplicated");
      }
    } else {
      setValidationMessage("Invalid Format");
    }
  }, [exists]);

  useEffect(() => {
    verifyAgain();
  }, [verifyAgain]);

  const isTxid = (value: string) => {
    const txRegex = /^0x([A-Fa-f0-9]{64})$/;

    return txRegex.test(value);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    if (name == "txid") {
      const trimmedValue = value.trim();
      const txRegex = /0x([A-Za-z0-9]{64})/;

      const matchResult = RegExp(txRegex).exec(trimmedValue);

      const extractedTxid = matchResult ? matchResult[0] : null;

      if (extractedTxid) {
        setEnteredTxid(extractedTxid);

        if (exists) {
          setValidationMessage("Duplicated");
        } else {
          setValidationMessage("Not Duplicated");
        }

        setAddNewTXIDData((prevData) => {
          const index = prevData.findIndex(
            (item: ITxidDataObject) => item.key === name,
          );

          const updatedData = [...prevData];
          updatedData[index] = { ...updatedData[index], value: extractedTxid };

          if (trimmedValue !== "" && updatedData[index].error !== null) {
            updatedData[index] = { ...updatedData[index], error: null };
          }

          return updatedData;
        });
      } else {
        setEnteredTxid(trimmedValue);

        setAddNewTXIDData((prevData) => {
          const index = prevData.findIndex(
            (item: ITxidDataObject) => item.key === name,
          );

          const updatedData = [...prevData];
          updatedData[index] = { ...updatedData[index], value: trimmedValue };

          if (trimmedValue !== "" && updatedData[index].error !== null) {
            updatedData[index] = { ...updatedData[index], error: null };
          }

          return updatedData;
        });
      }
    } else {
      setAddNewTXIDData((prevData) => {
        const index = prevData.findIndex(
          (item: ITxidDataObject) => item.key === name,
        );

        const updatedData = [...prevData];
        updatedData[index] = { ...updatedData[index], value: value };

        if (value.trim() !== "" && updatedData[index].error !== null) {
          updatedData[index] = { ...updatedData[index], error: null };
        }

        return updatedData;
      });
    }
  };

  const handleClose = () => {
    setEnteredTxid("");
    setValidationMessage("");
    setTXIDFieldError(false);
    onClose();
  };

  useEffect(() => {
    if (isEditMode && enteredTxid === "") {
      const txidField = data.find((d) => d.key === "txid");
      txidField && setTXIDFieldValue(txidField.value);
    } else {
      setTXIDFieldValue(enteredTxid);
    }
  }, [data, isEditMode, enteredTxid]);

  return (
    <CustomDialog
      open={open}
      titleText={text(
        isEditMode ? "edit_txid_modal_title" : "txid_management_add_title",
      )}
      onClose={handleClose}
    >
      <Box>
        <form className="w-full space-y-6">
          <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}>
            {data.map((el: ITxidDataObject) => {
              const getTXIDError = () => {
                const validationError = [
                  "Invalid Format",
                  "Duplicated",
                ].includes(validationMessage);

                return (
                  (el.key === "txid" &&
                    validationError &&
                    enteredTxid &&
                    !isReverifying &&
                    !isVerifying) ||
                  el.error
                );
              };

              const getFieldValue = () => {
                if (el.key === "txid") {
                  return isEditMode ? el.value : enteredTxid;
                }

                return el.value;
              };

              return (
                <Box key={el.key}>
                  <TextFieldInput
                    type={el.key === "amount" ? "number" : "text"}
                    error={
                      (el.key === "txid" && txidFieldError) ||
                      (getTXIDError() as boolean)
                    }
                    label={
                      text(`txid_management_${el.key}_title` as LocalKeys) +
                      " " +
                      (!el.required ? `(${text("field_optional_tag")})` : "")
                    }
                    placeholder={text(
                      `txid_management_enter_${el.key}_placeholder` as LocalKeys,
                    )}
                    value={getFieldValue()}
                    name={el.key}
                    onChange={handleInput}
                    disabled={el.disable}
                    helperText={
                      el.key === "txid" &&
                      txidFieldError &&
                      "TXID field is required"
                    }
                    onKeyDown={() =>
                      el.key === "txid" && setTXIDFieldError(false)
                    }
                  />
                  {el.key == "txid" && enteredTxid != "" && !isVerifying && (
                    <div className="flex">
                      {isReverifying && (
                        <div className="pt-2">
                          <Spinner />
                        </div>
                      )}
                      {validationMessage == "Duplicated" && !isReverifying && (
                        <span className="mt-2 rounded-full p-1 px-4 bg-red-500 text-white">
                          <p className="text-xs"> {validationMessage} </p>
                        </span>
                      )}
                      {validationMessage == "Not Duplicated" &&
                        !isReverifying && (
                          <span className="mt-2 rounded-full p-1 px-4 bg-green-500 text-white">
                            <p className="text-xs"> {validationMessage} </p>
                          </span>
                        )}
                      {validationMessage == "Invalid Format" &&
                        !isReverifying && (
                          <span className="mt-2 rounded-full p-1 px-4 bg-orange-500 text-white">
                            <p className="text-xs"> {validationMessage} </p>
                          </span>
                        )}
                    </div>
                  )}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", columnGap: 2 }}>
            <FormFooter
              onSubmit={(event) => {
                event.preventDefault();

                if (!txidFieldValue) {
                  return setTXIDFieldError(true);
                }

                onSubmit(() => {
                  setEnteredTxid("");
                  setValidationMessage("");
                  setTXIDFieldError(false);
                });
              }}
              cancelText={text("add_news_cancel_btn_text")}
              submitText={text("add_news_submit_btn_text")}
              handleClose={handleClose}
              loading={loading}
              disabled={
                (isReverifying ||
                  isVerifying ||
                  ((validationMessage === "Duplicated" ||
                    validationMessage === "Invalid Format") &&
                    enteredTxid &&
                    !isReverifying &&
                    !isVerifying)) as boolean
              }
            />
          </Box>
        </form>
      </Box>
    </CustomDialog>
  );
}
