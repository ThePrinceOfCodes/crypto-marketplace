import * as Yup from "yup";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button, MenuItem, Box } from "@mui/material";
import { useLocale } from "locale";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  IAdsManagementSaveModalProps,
  IAdsManagementSubmitData,
} from "./types";
import { Formik, Form } from "formik";
import FormFooter from "@common/components/FormFooter";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import SelectField from "@common/components/FormInputs/SelectField";
import {
  requiredStringURLValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";

const defaultInitialValues = {
  type: "" as unknown as number,
  link: "",
  text1: "",
  text2: "",
  text3: "",
  image: "",
};

function AdsManagementSaveModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
  initialValues,
  isEditMode,
}: Readonly<IAdsManagementSaveModalProps>) {
  const { text } = useLocale();
  const [type, setType] = useState<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialValues = () => initialValues || defaultInitialValues;

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["type", ...(type === 2 ? [] : ["text1", "text2", "text3"])],
      text("form_error_required"),
    );

    const url_v = requiredStringURLValidator(
      ["link"],
      text("form_error_required"),
      text("form_error_invalid_url"),
    );

    return Yup.object().shape({
      ...string_v,
      ...url_v,
      ...(!isEditMode? { image: Yup.mixed().required(text("add_ads_management_image_required")) } : {}),
    });
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleOnSubmit = (data: IAdsManagementSubmitData) => {
    if (!isEditMode && !data.image) {
      toast.error(text("add_ads_management_image_required"));
      return;
    }

    if (type === 2) {
      data.text1 = "";
      data.text2 = "";
      data.text3 = "";
    }

    const formData = Object.fromEntries(
      Object.entries(data).filter(([__, value]) => value),
    );

    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    onOk(formData);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={
        isEditMode
          ? text("add_ads_management_modal_update_title")
          : text("add_ads_management_modal_add_title")
      }
    >
      <Formik
        validationSchema={validationSchema()}
        initialValues={getInitialValues()}
        onSubmit={(values) => handleOnSubmit(values)}
        validateOnBlur={false}
      >
        {({ values, errors, touched, getFieldProps, setFieldValue }) => {
          //eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            setType(values.type);
          }, [values]);

          function fieldProps(field: keyof IAdsManagementSubmitData) {
            const error = touched[field] && Boolean(errors[field]);
            const helperText = touched[field] && errors[field];

            return { error, helperText, ...getFieldProps(field) };
          }

          const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files
              ? event.target.files[0]
              : null;
            if (selectedFile) {
              setFieldValue("image", selectedFile);
            }
          };

          const imageError = touched.image && Boolean(errors.image);
          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                {!isEditMode && (
                  <Box>
                    <label className="block mb-2 text-sm font-medium text-slate-500">
                      {text("ads_management_add_page_image")}
                    </label>
                    <Box>
                      <Button
                        onClick={handleButtonClick}
                        variant="outlined"
                        startIcon={!values.image && <CloudUploadIcon />}
                        endIcon={
                          values.image && (
                            <CloseIcon
                              onClick={(event: any) => {
                                event.stopPropagation();
                                setFieldValue("image", "");
                              }}
                            />
                          )
                        }
                        className={`w-full truncate ${imageError ? "border-red-500" : ""}`}
                      >
                        <span className="block overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {values.image
                            ? //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              //@ts-ignore
                              values.image.name
                            : text("add_ads_management_upload_btn_text")}
                        </span>
                      </Button>
                      {imageError && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.image}
                        </p>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </Box>
                  </Box>
                )}

                <SelectField
                  placeholder={text("add_ads_management_type_placeholder")}
                  label={text("ads_management_add_page_type")}
                  {...fieldProps("type")}
                  variant="outlined"
                >
                  {[
                    { label: "1", value: 1 },
                    { label: "2", value: 2 },
                  ].map((item: { label: string; value: number }) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </SelectField>

                <TextFieldInput
                  placeholder={text("add_ads_management_link_placeholder")}
                  label={text("ads_management_add_page_link")}
                  {...fieldProps("link")}
                />

                {values.type !== 2 && (
                  <>
                    <TextFieldInput
                      placeholder={text("add_ads_management_text1_placeholder")}
                      label={text("ads_management_add_page_text1")}
                      {...fieldProps("text1")}
                    />

                    <TextFieldInput
                      placeholder={text("add_ads_management_text2_placeholder")}
                      label={text("ads_management_add_page_text2")}
                      {...fieldProps("text2")}
                    />

                    <TextFieldInput
                      multiline
                      rows={4}
                      placeholder={text("add_ads_management_text3_placeholder")}
                      label={text("ads_management_add_page_text3")}
                      {...fieldProps("text3")}
                    />
                  </>
                )}

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={onCancel}
                    loading={isSubmitting}
                    cancelText={text("add_ads_management_cancel_btn_text")}
                    submitText={text("add_ads_management_submit_btn_text")}
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

export default AdsManagementSaveModal;
