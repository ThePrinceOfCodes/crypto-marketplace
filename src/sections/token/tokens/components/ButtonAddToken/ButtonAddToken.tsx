import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useLocale } from "locale";
import { Box } from "@mui/material";
import { toast } from "react-toastify";
import { IAddTokensErr, useAddTokens } from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import { Formik, Form } from "formik";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import FileUpload from "@common/components/FormInputs/FileUpload";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import CustomDialog from "@common/components/CustomDialog";
import * as Yup from "yup";

interface ButtonAddTokenProps {
  onAdded?: () => void;
}

const initialValues = {
  token_name: "",
  rate: "",
};

const ButtonAddToken = (props: ButtonAddTokenProps) => {
  const { text } = useLocale();
  const { onAdded } = props;

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | Blob | null>(null);
  const [createObjectURL, setCreateObjectURL] = useState<string | null>(null);
  const { mutateAsync: addTokens, isLoading: submitting } = useAddTokens();

  const handleClose = () => {
    setOpen(false);
    setImage(null);
    setCreateObjectURL(null);
  };

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["token_name", "rate"],
      text("form_error_required"),
    );

    return Yup.object().shape({ ...string_v });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: { token_name: string; rate: string }) => {
    const { token_name, rate } = data;

    if (!image) {
      toast(text("token_upload_image_toast"), { type: "error" });
      return;
    }

    // 10 MB size limit check
    if (image.size > 10 * 1024 * 1024) {
      toast(text("token_upload_image_size_error"), { type: "error" });
      return;
    }

    const f = new FormData();
    f.append("tokenName", token_name);
    f.append("price", rate);
    f.append("file", image);

    addTokens(f)
      .then(() => {
        toast(text("token_add_token_successfully"), { type: "success" });
        setOpen(false);
        setCreateObjectURL(null);
        if (onAdded) onAdded();
      })
      .catch((err: IAddTokensErr) => {
        toast(err?.response?.data?.message, { type: "error" });
      });
  };

  return (
    <div>
      <button
        id={htmlIds.btn_add_token_modal_display_open}
        className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span className="text-nowrap">{text("token_add_new_token_title")}</span>
      </button>

      <CustomDialog
        open={open}
        onClose={() => handleClose()}
        titleText={text("token_add_token_title")}
      >
        <FileUpload
          setFile={setImage}
          setFileUrl={setCreateObjectURL}
          previewFile={createObjectURL}
        />

        <span className="text-xs italic">{text("token_image_file_size")}</span>

        <Box sx={{ mt: 3 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema()}
            onSubmit={(values) => onSubmit(values)}
          >
            {({ getFieldProps, errors, touched }) => {
              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}
                  >
                    <TextFieldInput
                      error={
                        touched["token_name"] && Boolean(errors["token_name"])
                      }
                      helperText={touched["token_name"] && errors["token_name"]}
                      label={text("token_name_input_title")}
                      placeholder={text("add_token_placeholder")}
                      {...getFieldProps("token_name")}
                    />
                    <TextFieldInput
                      error={touched["rate"] && Boolean(errors["rate"])}
                      helperText={touched["rate"] && errors["rate"]}
                      label={text("add_token_rate_title")}
                      placeholder={text("add_token_enter_rate")}
                      type="number"
                      {...getFieldProps("rate")}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        handleClose={handleClose}
                        loading={submitting}
                        submitText={text("add_token_submit")}
                        cancelText={text("add_token_cancel")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </CustomDialog>
    </div>
  );
};

export default ButtonAddToken;
