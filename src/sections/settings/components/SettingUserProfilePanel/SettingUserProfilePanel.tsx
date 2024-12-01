import { Spinner } from "@common/components";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { useAuth } from "@common/context";
import { htmlIds } from "@cypress/utils/ids";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import { Avatar, Button, ListItemText, MenuItem } from "@mui/material";
import ConfirmationDialog from "@sections/shared-components/ConfirmationDialog";
import { useSetLanguage } from "api/hooks";
import { useFormik } from "formik";
import { LocalKeys, LocalsType, useLocale } from "locale";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { UpdatePhoneNumber } from "./components";

type changeLanguageType = {
  label: string;
  value: LocalsType;
};

const CHANGE_LANGUAGE: changeLanguageType[] = [
  { label: "setting_profile_langugae_english", value: "en_US" },
  { label: "setting_profile_langugae_korean", value: "ko_KR" },
];

function SettingUserProfilePanel() {
  const { text, locale, changeLocale } = useLocale();
  const { user, updateUser } = useAuth();

  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const { mutateAsync: changeLanguage, isLoading: changeLocaleLoading } =
    useSetLanguage();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileInputRef = React.useRef<any | null>(null);

  useEffect(() => {
    if (user) {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      formik.resetForm({
        values: {
          [htmlIds.input_setting_profile_name]: user?.name || "",
          [htmlIds.input_setting_profile_email]: user?.email || "",
          [htmlIds.input_setting_profile_image_upload]: null,
          imageUrl: user?.avatar || "",
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChangeLocale = async (_locale: LocalsType) => {
    changeLocale(_locale);
    await changeLanguage(
      { language: _locale },
      {
        onSuccess: () => {
          toast(text("setting_users_language_successfully"), {
            type: "success",
          });
        },
        onError: () => {
          toast(text("setting_users_language_error"), { type: "error" });
        },
      },
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      formik.setFieldValue(
        htmlIds.input_setting_profile_image_upload,
        selectedFile,
      );
      formik.setFieldValue("imageUrl", URL.createObjectURL(selectedFile));
    }
  };

  const handleDeleteImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    formik.setFieldValue(htmlIds.input_setting_profile_image_upload, null);
    formik.setFieldValue("imageUrl", user?.avatar);
  };

  const handleResetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    formik.resetForm();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async ({ name, image }: { name?: string; image?: any }) => {
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (image) formData.append("file", image);
      await updateUser(formData);
      toast.success(text("setting_users_updated_successfully"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  const handleResetView = () => {
    const keys = Object.keys(localStorage);
    const keyToRemove = keys.filter((key) => key.includes("ColumnState"));
    keyToRemove.forEach((key) => localStorage.removeItem(key));
    toast(text("reset_all_views_success"), { type: "success" });
    setIsResetConfirm(false);
  };

  const formik = useFormik({
    initialValues: {
      [htmlIds.input_setting_profile_name]: "",
      [htmlIds.input_setting_profile_email]: "",
      [htmlIds.input_setting_profile_image_upload]: null,
      imageUrl: "",
    },
    validationSchema: Yup.object({
      [htmlIds.input_setting_profile_name]: Yup.string().required(
        text("setting_profile_user_details_name_required"),
      ),
      [htmlIds.input_setting_profile_email]: Yup.string().required(
        text("setting_profile_user_details_email_required"),
      ),
      [htmlIds.input_setting_profile_image_upload]: Yup.mixed()
        .nullable()
        .notRequired()
        .test(
          "fileSize",
          text("setting_profile_profile_image_toast_warning"),
          (value) =>
            !value ||
            (fileInputRef?.current?.files[0] &&
              fileInputRef.current.files[0].size / 1024 <= 1024),
        )
        .test(
          "fileFormat",
          text("setting_profile_unsupported_image_format"),
          (value) =>
            !value ||
            (fileInputRef?.current?.files[0] &&
              [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/bmp",
                "image/webp",
              ].includes(fileInputRef.current.files[0].type)),
        ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const {
        input_setting_profile_name: name,
        input_setting_profile_image_upload: image,
      } = values;

      await onSubmit({ name, image });
      setSubmitting(false);
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 border-b py-3">
        <div>
          <h2 className="text-2xl font-medium">
            {text("setting_profile_account_info_title")}
          </h2>
          <p className="text-sm text-slate-500">
            {text("setting_profile_account_info_subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <FormFooter
            submitBtnId={htmlIds.btn_setting_profile_submit_form}
            submitText={text("setting_profile_account_info_button_save")}
            cancelText={text("setting_profile_account_info_button_cancel")}
            onSubmit={() => formik.handleSubmit()}
            handleClose={handleResetForm}
            loading={formik.isSubmitting}
            sx={{ "min-width": "100px" }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 border-b py-5">
        <div className="w-64">
          <h2>{text("setting_profile_profile_image_title")}</h2>
          <p className="text-slate-500 text-sm font-light">
            {text("setting_profile_profile_image_subtitle")}
          </p>
        </div>
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-8">
            <div>
              <Avatar
                id={htmlIds.avatar_setting_user_profile_image}
                alt="User avatar"
                src={formik.values.imageUrl || ""}
                className="w-16 h-16 border-2"
              />
            </div>

            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3">
                <input
                  id={htmlIds.input_setting_profile_image_upload}
                  name={htmlIds.input_setting_profile_image_upload}
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/bmp, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <Button
                  onClick={() => fileInputRef?.current?.click()}
                  variant="outlined"
                  startIcon={<CloudUploadOutlined />}
                >
                  {text("setting_profile_profile_upload_button")}
                </Button>
                <Button
                  onClick={handleDeleteImage}
                  variant="outlined"
                  color="error"
                  disabled={formik.values.imageUrl === user?.avatar}
                >
                  {text("setting_profile_profile_delete_button")}
                </Button>
              </div>

              <p className="text-xs text-slate-500">
                {text("setting_profile_profile_recommended_image")}
              </p>
              <div className="text-xs text-red-500">
                {formik.errors[htmlIds.input_setting_profile_image_upload]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 border-b py-5">
        <div className="w-64">
          <h2>{text("setting_profile_user_details_title")}</h2>
          <p className="text-slate-500 text-sm font-light">
            {text("setting_profile_user_details_subtitle")}
          </p>
        </div>
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
            <div className="w-full xl:w-72">
              <TextFieldInput
                error={
                  formik.touched[htmlIds.input_setting_profile_name] &&
                  !!formik.errors[htmlIds.input_setting_profile_name]
                }
                helperText={
                  formik.touched[htmlIds.input_setting_profile_name] &&
                  formik.errors[htmlIds.input_setting_profile_name]
                }
                placeholder={text("setting_profile_user_details_name")}
                label={text("setting_profile_user_details_name")}
                {...formik.getFieldProps(htmlIds.input_setting_profile_name)}
              />
            </div>

            <div className="w-full xl:w-72">
              <TextFieldInput
                disabled
                error={
                  formik.touched[htmlIds.input_setting_profile_email] &&
                  !!formik.errors[htmlIds.input_setting_profile_email]
                }
                helperText={
                  formik.touched[htmlIds.input_setting_profile_email] &&
                  formik.errors[htmlIds.input_setting_profile_email]
                }
                placeholder={text("setting_profile_user_details_email")}
                label={text("setting_profile_user_details_email")}
                {...formik.getFieldProps(htmlIds.input_setting_profile_email)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 border-b py-5">
        <div className="w-64">
          <h2>{text("setting_profile_phoneNumber_update_title")}</h2>
          <p className="text-slate-500 text-sm font-light">
            {text("setting_profile_phoneNumber_update_subtitle")}
          </p>
        </div>
        <div className="flex-1">
          <UpdatePhoneNumber />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 border-b py-5">
        <div className="w-64">
          <h2 id={htmlIds.span_setting_profile_language_label}>
            {text("setting_profile_language_title")}
          </h2>
          <p className="text-slate-500 text-sm font-light">
            {text("setting_profile_language_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SelectField
              id={htmlIds.select_setting_profile_language_select}
              label={text("setting_profile_language_title")}
              variant="outlined"
              value={locale}
              onChange={(e) => handleChangeLocale(e.target.value as LocalsType)}
            >
              {CHANGE_LANGUAGE.map((item) => {
                return (
                  <MenuItem
                    className="text-xs text-neutral-500"
                    key={item.value}
                    value={item.value}
                  >
                    <ListItemText
                      className="text-xs"
                      primary={text(item.label as LocalKeys)}
                    />
                  </MenuItem>
                );
              })}
            </SelectField>
          </div>
          {changeLocaleLoading && <Spinner />}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 border-b py-5">
        <div className="w-64">
          <h2 id={htmlIds.span_setting_profile_reset_all_view_label}>
            {text("reset_all_views")}
          </h2>
          <p className="text-slate-500 text-sm font-light">
            {text("reset_all_views_subtitle")}
          </p>
        </div>
        <div className="flex-1">
          <Button
            type="reset"
            variant="outlined"
            color="inherit"
            onClick={() => setIsResetConfirm(true)}
          >
            {text("reset_all_views")}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        openConfirmDialog={isResetConfirm}
        setOpenConfirmDialog={setIsResetConfirm}
        onYesHandler={handleResetView}
        confirmMessage="reset"
      />
    </div>
  );
}

export default SettingUserProfilePanel;
