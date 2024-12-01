import * as Yup from "yup";
import { ChangeEvent, useRef } from "react";
import { Button, Box } from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import { IPopUpSaveModalProps, IPopUpSubmitData } from "./types";
import { Formik, Form } from "formik";
import {
  stringURLValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import DatesField from "@common/components/FormInputs/DatesField";
import CustomDialog from "@common/components/CustomDialog";
import dayjs from "dayjs";
import { handleMinMaxDate } from "@common/utils/helpers";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

const defaultInitialValues = {
  image: null,
  title: "",
  link: "",
  startDate: "",
  endDate: "",
  content: "",
};

function PopUpSaveModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
  initialValues,
  isEditMode,
}: Readonly<IPopUpSaveModalProps>) {
  const { text } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["title"],
      text("form_error_required"),
    );

    const url_v = stringURLValidator(["link"], text("form_error_invalid_url"));

    return Yup.object().shape({
      ...string_v,
      ...url_v,
      startDate: Yup.date()
        .required(text("form_error_required"))
        .typeError(text("form_error_invalid_date")),
      endDate: Yup.date()
        .required(text("form_error_required"))
        .typeError(text("form_error_invalid_date"))
        .test(
          "is-greater",
          text("form_error_end_date_error"),
          function (value) {
            const { startDate } = this.parent;
             return dayjs(value).isSameOrAfter(dayjs(startDate));
          },
        ),
    });
  };

  const getInitialValues = () => initialValues ?? defaultInitialValues;

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleOnSubmit = (data: IPopUpSubmitData) => {
    onOk(data);
  };

  return (
    <CustomDialog
      open={open}
      onClose={() => onCancel()}
      titleText={
        isEditMode
          ? text("add_popup_modal_update_title")
          : text("add_popup_modal_add_title")
      }
    >
      <Formik
        validationSchema={validationSchema()}
        initialValues={getInitialValues()}
        onSubmit={(val) => handleOnSubmit(val)}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({
          values,
          errors,
          touched,
          getFieldProps,
          setFieldTouched,
          setFieldValue,
        }) => {
          function fieldProps(field: keyof IPopUpSubmitData) {
            const error = touched[field] && Boolean(errors[field]);
            const helperText =
              touched[field] && (errors[field] as React.ReactNode);

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

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                {!isEditMode && (
                  <Box>
                    <label className="block mb-2 text-sm font-medium text-slate-500">
                      {text("popups_add_page_image")}
                      <span className="text-[10px]">
                        ({text("field_optional_tag")})
                      </span>
                    </label>
                    <Box>
                      <Button
                        onClick={handleButtonClick}
                        variant="outlined"
                        startIcon={!values.image && <CloudUploadIcon />}
                        endIcon={
                          values.image && (
                            //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            //@ts-ignore
                            <CloseIcon
                              onClick={(event: Event) => {
                                event.stopPropagation();
                                setFieldValue("image", "");
                              }}
                            />
                          )
                        }
                        className="w-full truncate"
                      >
                        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {values.image
                            ? //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              //@ts-ignore
                              values.image?.name
                            : text("add_ads_management_upload_btn_text")}
                        </span>
                      </Button>
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

                <TextFieldInput
                  label={text("popups_add_page_title")}
                  placeholder={text("add_popup_title_placeholder")}
                  {...fieldProps("title")}
                />

                <TextFieldInput
                  label={text("popups_add_page_link")}
                  placeholder={text("add_popup_link_placeholder")}
                  {...fieldProps("link")}
                />

                {[
                  { name: "startDate", label: "popups_add_page_start_date" },
                  { name: "endDate", label: "popups_add_page_end_date" },
                ].map((item: { name: string; label: string }) => {
                  const key = item.name as keyof IPopUpSubmitData;

                  return (
                    <DatesField
                      key={key}
                      label={text(item.label as LocalKeys)}
                      error={touched[key] && Boolean(errors[key])}
                      helperText={
                        touched[key] && (errors[key] as React.ReactNode)
                      }
                      onBlur={() =>
                        !values[key] || !dayjs(values[key]).isValid()
                          ? setFieldTouched(item.name, true)
                          : null
                      }
                      onChange={(event) => {
                        setFieldValue(
                          item.name,
                          event ? dayjs(event).format("YYYY-MM-DD") : null,
                        );
                      }}
                      {...(initialValues
                        ? { value: dayjs(initialValues[key]) }
                        : {})}
                      minDate={handleMinMaxDate(item.name, values).min}
                      maxDate={handleMinMaxDate(item.name, values).max}
                    />
                  );
                })}

                <TextFieldInput
                  label={text("popups_add_page_content")}
                  placeholder={text("add_popup_content_placeholder")}
                  multiline
                  rows={4}
                  {...fieldProps("content")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={() => onCancel()}
                    loading={isSubmitting}
                    cancelText={text("add_popup_cancel_btn_text")}
                    submitText={text("add_popup_submit_btn_text")}
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

export default PopUpSaveModal;
