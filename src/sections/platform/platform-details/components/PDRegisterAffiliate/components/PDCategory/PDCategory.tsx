import React, { forwardRef, useState } from "react";
import TextFieldInput from "@common/components/FormInputs/TextField";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import * as Yup from "yup";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useLocale } from "locale";

type PDCategoryProps = {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOk: (v: string) => Promise<any>;
};

function PDCategory(props: PDCategoryProps) {
  const { onClose, onOk } = props;
  const [loading, setLoading] = useState(false);
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    onClose();
    setLoading(false);
    setOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onOk(data?.category_list);
      handleClose();
    } catch {
      setLoading(false);
    }
  };

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["category_list"],
      text("form_error_required"),
    );

    return Yup.object().shape({ ...string_v });
  };

  return (
    <>
      <button
        className="flex items-center text-md px-4 h-11 bg-blue-500 text-white rounded-lg my-1"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span>{text("affiliate_register_add_category")}</span>
      </button>

      <CustomDialog
        open={open}
        onClose={handleClose}
        titleText={text("affiliate_register_add_category")}
      >
        <Formik
          initialValues={{ category_list: "", roles: [] }}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
          }}
          validationSchema={validationSchema()}
        >
          {({ getFieldProps, touched, errors }) => {
            return (
              <Form>
                <TextFieldInput
                  label={text("affiliate_add_category")}
                  placeholder={text("affiliate_add_category_placeholder")}
                  error={
                    touched["category_list"] && Boolean(errors["category_list"])
                  }
                  helperText={
                    touched["category_list"] && errors["category_list"]
                  }
                  {...getFieldProps("category_list")}
                />

                <Box sx={{ display: "flex", mt: 3, columnGap: 2 }}>
                  <FormFooter
                    handleClose={handleClose}
                    loading={loading}
                    cancelText={text("affiliate_register_cancel")}
                    submitText={text("affiliate_register_add_button")}
                  />
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomDialog>
    </>
  );
}

export default forwardRef(PDCategory);
