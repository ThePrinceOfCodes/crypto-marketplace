import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import {
  Alert,
  Checkbox,
  FormControl,
  ListItemText,
  Box,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import dayjs from "dayjs";
import { MassExcelDownloadModalRef } from "./types";
import DatesField from "@common/components/FormInputs/DatesField";
import SelectField from "@common/components/FormInputs/SelectField";
import FormFooter from "@common/components/FormFooter";
import CustomDialog from "@common/components/CustomDialog";
import { Formik, Form } from "formik";
import * as Yup from "yup";
type MassExcelDownloadModalProps = {
  onClose: () => void;
  onOk: (
    v: string,
    is_unpaid?: boolean,
    selectedBankFormat?: string,
  ) => Promise<any>;
  title: string;
  alert?: string;
  isKRW : boolean;
};

function MassExcelDownloadModal(
  props: MassExcelDownloadModalProps,
  ref: Ref<MassExcelDownloadModalRef>,
) {
  const [is_unpaid, setIs_unpaid] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState("shinhan_bank");
  const { onClose, onOk, title, alert, isKRW } = props;
  const [loading, setLoading] = useState(false);
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

  const handleOnChangeBank = (newBankName: string) => {
    setSelectedBankName(newBankName);
  };

  const filterOptions = [
    {
      label: text("withdrawal_information_bank_shinhan_bank"),
      value: "shinhan_bank",
    },
    {
      label: text("withdrawal_information_bank_suhyup_bank"),
      value: "suhyup_bank",
    },
    {
      label: text("withdrawal_information_bank_hana_bank"),
      value: "hana_bank",
    },
  ];

  const handleClose = () => {
    onClose();
    setIs_unpaid(false);
    setLoading(false);
    setOpen(false);
    setSelectedBankName("shinhan_bank");
  };

  const handleOk = async ({ date }: { date: string }) => {
    try {
      setLoading(true);
      await onOk(date, is_unpaid ? is_unpaid : undefined, selectedBankName);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setOpen(true);
      },
    }),
    [],
  );
  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .nullable()
      .required(text("form_error_required"))
      .typeError(text("form_error_invalid_date")),
    selectedBankName: Yup.string().required("Please select a bank"),
  });
  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={text(title as LocalKeys)}
    >
      <Formik
        initialValues={{
          date: dayjs().format("YYYY-MM-DD"),
          is_unpaid: false,
          selectedBankName: "shinhan_bank",
        }}
        validationSchema={validationSchema}
        onSubmit={handleOk}
      >
        {({ touched, errors, values, setFieldValue, setFieldTouched }) => (
          <Form>
            <DatesField
              label="Select Date"
              value={dayjs(values.date)}
              onChange={(newDate) => {
                setFieldValue("date", newDate ? dayjs(newDate).format("YYYY-MM-DD") : null);
              }}
              onBlur={() => {
                setFieldTouched("date", true)
              }}
              error={touched["date"] && Boolean(errors["date"])}
              helperText={touched["date"] && errors["date"]}
              format="YYYY-MM-DD"
              className="text-slate-700 text-sm hover:text-slate-600 font-small w-full h-[50px] border-none rounded-lg mt-4"
            />

            {isKRW && <FormControl fullWidth className="mt-6">
              <SelectField
                className="h-[50px]  rounded-lg"
                value={selectedBankName}
                onChange={(e) => handleOnChangeBank(e.target.value as string)}
                options={filterOptions.map((item) => ({
                  value: item.value,
                  label: text(item.label as LocalKeys),
                }))}
                label={text(
                  "withdrawal_information_mass_excel_select_bank_format",
                )}
                variant="outlined"
              />
            </FormControl>}

            <Box
              className="flex items-center mt-5 cursor-pointer space-x-4 "
              onClick={() => setIs_unpaid(!is_unpaid)}
            >
              <label aria-label="unpaid transfer">
                <Checkbox checked={is_unpaid} className="w-4 h-4" />
              </label>
              <ListItemText
                className="text-xs"
                primary={text("withdrawal_information_mass_excel_unpaid")}
              />
            </Box>

            {alert && (
              <Alert className={"mt-5"} severity="warning">
                {alert}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                columnGap: 2,
                paddingX: "16px",
                marginTop: "20px",
              }}
            >
              <FormFooter
                loading={loading}
                submitText={text("date_modal_ok_text")}
                handleClose={handleClose}
                cancelText={text("date_modal_cancel_text")}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </CustomDialog>
  );
}

export default forwardRef(MassExcelDownloadModal);
