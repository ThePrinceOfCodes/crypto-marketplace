import React, { ChangeEvent, useRef, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useLocale } from "locale";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { INewsSaveModalProps, INewsSubmitData } from "./types";
import dayjs from "dayjs";
import { useSaveFile } from "api/hooks";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import DatesField from "@common/components/FormInputs/DatesField";
import { Formik, Form } from "formik";
import useResponsive from "@common/hooks/useResponsive";
import FormFooter from "@common/components/FormFooter";
import {
  requiredStringURLValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";
import * as Yup from "yup";

const defaultInitialValues = {
  title: "",
  url: "",
  date: "",
  imageUrl: "",
  subtitle: "",
};

interface FormData {
  date: string;
  imageUrl: string;
  subtitle: string;
  title: string;
  url: string;
}

function NewsSaveModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
  initialValues,
  isEditMode,
}: Readonly<INewsSaveModalProps>) {
  const { text } = useLocale();
  const { isMobile } = useResponsive();
  const { mutateAsync: saveFile } = useSaveFile();
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["title", "subtitle", "date"],
      text("form_error_required"),
    );
    const url_v = requiredStringURLValidator(
      ["url", "imageUrl"],
      text("form_error_required"),
      text("form_error_invalid_url"),
    );

    return Yup.object().shape({
      ...string_v,
      ...url_v,
      date: Yup.date()
        .nullable()
        .required(text("form_error_required"))
        .typeError(text("form_error_invalid_date")),
    });
  };

  const getInitialValues = () => initialValues || defaultInitialValues;

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleOnSubmit = (data: FormData) => {
    onOk(data as INewsSubmitData);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={
        isEditMode
          ? text("add_new_modal_update_title")
          : text("add_new_modal_add_title")
      }
    >
      <Formik
        initialValues={getInitialValues()}
        onSubmit={(values) => handleOnSubmit(values)}
        validationSchema={validationSchema()}
        validateOnBlur={false}
      >
        {({
          values,
          getFieldProps,
          errors,
          touched,
          setFieldValue,
          setFieldTouched,
        }) => {
          function fieldProps(field: keyof FormData) {
            const error = touched[field] && Boolean(errors[field]);
            const helperText = touched[field] && errors[field];

            return { error, helperText, ...getFieldProps(field) };
          }

          const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files
              ? event.target.files[0]
              : null;
            const acceptedFileTypes = event.target.accept.split(',')
              .map(item => item.trim());
              
            if (selectedFile) {
              if (!acceptedFileTypes.includes(selectedFile?.type)) {
                toast.error(text("token_image_file_type_error"));
                return;
              }
              setFileLoading(true);
              saveFile(
                { file: selectedFile },
                {
                  onSuccess: (data) => {
                    setFieldValue("imageUrl", data);
                    toast.success(text("add_news_upload_file_success"));
                    setFileLoading(false);
                  },
                  onError: () => {
                    toast.error(text("toast_error_uploading_file"));
                    setFileLoading(false);
                  },
                },
              );
            }
          };

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <TextFieldInput
                  label={text("add_news_name_title")}
                  placeholder={text("add_news_name_placeholder")}
                  {...fieldProps("title")}
                />

                <TextFieldInput
                  label={text("add_news_url_title")}
                  placeholder={text("add_news_url_placeholder")}
                  {...fieldProps("url")}
                />

                <DatesField
                  label={text("add_news_date_title")}
                  error={touched["date"] && Boolean(errors["date"])}
                  helperText={touched["date"] && errors["date"]}
                  onBlur={() => {
                    !values.date || !dayjs(values.date).isValid() ? setFieldTouched("date", true) : null;
                  }}
                  onChange={(event) => {
                    setFieldValue("date", event ? dayjs(event).toString() : null);
                  }}
                  {...(initialValues ? { value: dayjs(values.date) } : {})}
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    flexDirection: isMobile ? "column" : "row",
                    columnGap: isMobile ? 0 : 2,
                    rowGap: isMobile ? 2 : 0,
                  }}
                >
                  <TextFieldInput
                    label={text("add_news_image_title")}
                    placeholder={text("add_news_image_placeholder")}
                    {...fieldProps("imageUrl")}
                  />

                  <Box sx={{ minWidth: isMobile ? "100%" : 132 }}>
                    <Button
                      onClick={handleButtonClick}
                      variant="outlined"
                      startIcon={
                        fileLoading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <CloudUploadIcon />
                        )
                      }
                      sx={{ py: isMobile ? 0 : 1.1 }}
                    >
                      {fileLoading
                        ? text("add_news_upload_btn_text_loading")
                        : text("add_news_upload_btn_text")}
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/bmp, image/webp"
                      className="hidden"
                      disabled={isSubmitting}
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </Box>
                </Box>

                <TextFieldInput
                  rows={4}
                  multiline
                  label={text("add_news_description_title")}
                  placeholder={text("add_news_description_placeholder")}
                  {...fieldProps("subtitle")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={onCancel}
                    loading={isSubmitting}
                    disabled={fileLoading}
                    cancelText={text("add_news_cancel_btn_text")}
                    submitText={text("add_news_submit_btn_text")}
                  />
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
}

export default NewsSaveModal;
