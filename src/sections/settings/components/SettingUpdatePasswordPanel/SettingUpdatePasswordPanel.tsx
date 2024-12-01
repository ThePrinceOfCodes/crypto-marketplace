import React, { useImperativeHandle, forwardRef } from "react";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { htmlIds } from "@cypress/utils/ids";
import { useUpdateUserPassword } from "api/hooks";
import { useFormik } from "formik";
import { useLocale } from "locale";
import { toast } from "react-toastify";
import * as Yup from "yup";

  const SettingUpdatePasswordPanel = forwardRef<{
    resetForm: () => void;
  }>(function SettingUpdatePasswordPanel(_, ref) {
  const { text } = useLocale();
  const { mutateAsync: updateUserPassword } = useUpdateUserPassword();

  const formik = useFormik({
    initialValues: {
      [htmlIds.input_setting_password_current_password]: "",
      [htmlIds.input_setting_password_new_password]: "",
      [htmlIds.input_setting_password_new_password_confirm]: "",
    },
    validationSchema: Yup.object({
      [htmlIds.input_setting_password_current_password]: Yup.string().required(
        text("setting_password_password_change_current_password_required"),
      ),
      [htmlIds.input_setting_password_new_password]: Yup.string()
        .min(6, text("setting_password_password_min_length"))
        .required(
          text("setting_password_password_change_new_password_required"),
        ),
      [htmlIds.input_setting_password_new_password_confirm]: Yup.string()
        .required(
          text(
            "setting_password_password_change_confirm_new_password_required",
          ),
        )
        .oneOf(
          [Yup.ref(htmlIds.input_setting_password_new_password), ""],
          text(
            "setting_password_password_change_confirm_new_password_not_matched",
          ),
        ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const {
        input_setting_password_current_password: currentPassword,
        input_setting_password_new_password: newPassword,
      } = values;
      try {
        await updateUserPassword({ currentPassword, newPassword });
        toast.success(text("setting_password_toast_updated_successfully"));
        formik.resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (typeof err?.response?.data === "string")
          toast.error(err.response.data);
        else toast.error(err.response.data?.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useImperativeHandle(ref, () => ({
    resetForm: formik.resetForm,
  }));

  return (
    <div>
      <div className="w-full pb-3 mb-5 platforms-header flex flex-row justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium">
            {text("setting_password_privacy_title")}
          </h2>
          <p className="text-sm text-slate-500">
            {text("setting_password_privacy_subtitle")}
          </p>
        </div>
        <div className="hidden md:flex space-x-3">
          <FormFooter
            submitBtnId={htmlIds.btn_setting_password_save}
            submitText={text("setting_password_privacy_save_button")}
            cancelText={text("setting_password_privacy_cancel_button")}
            handleClose={() => formik.resetForm()}
            onSubmit={() => formik.handleSubmit()}
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            sx={{ "min-width" : "100px" }}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-12 gap-3">
        <div className="md:col-span-4 justify-center">
          <h2>{text("setting_password_password_change_title")}</h2>
          <p className="text-slate-500 text-sm font-light">
            {text("setting_password_password_change_subtitle")}
          </p>
        </div>
        <div className="md:col-span-8 lg:col-span-7 xl:col-span-6">
          <form
            onSubmit={formik.handleSubmit}
            className="w-full flex flex-col gap-4"
          >
            <TextFieldInput
              error={
                formik.touched[
                  htmlIds.input_setting_password_current_password
                ] &&
                !!formik.errors[htmlIds.input_setting_password_current_password]
              }
              helperText={
                formik.touched[
                  htmlIds.input_setting_password_current_password
                ] &&
                formik.errors[htmlIds.input_setting_password_current_password]
              }
              placeholder={text("setting_password_password_change_current_password")}
              label={text("setting_password_password_change_current_password")}
              type="password"
              autoComplete="new-password"
              {...formik.getFieldProps(
                htmlIds.input_setting_password_current_password,
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <TextFieldInput
                error={
                  formik.touched[htmlIds.input_setting_password_new_password] &&
                  !!formik.errors[htmlIds.input_setting_password_new_password]
                }
                helperText={
                  formik.touched[htmlIds.input_setting_password_new_password] &&
                  formik.errors[htmlIds.input_setting_password_new_password]
                }
                placeholder="Password"
                label={text("setting_password_password_change_new_password")}
                type="password"
                autoComplete="new-password"
                {...formik.getFieldProps(
                  htmlIds.input_setting_password_new_password,
                )}
              />

              <TextFieldInput
                error={
                  formik.touched[
                    htmlIds.input_setting_password_new_password_confirm
                  ] &&
                  !!formik.errors[
                    htmlIds.input_setting_password_new_password_confirm
                  ]
                }
                helperText={
                  formik.touched[
                    htmlIds.input_setting_password_new_password_confirm
                  ] &&
                  formik.errors[
                    htmlIds.input_setting_password_new_password_confirm
                  ]
                }
                placeholder={text(
                  "setting_password_password_change_confirm_new_password",
                )}
                label={text(
                  "setting_password_password_change_confirm_new_password",
                )}
                type="password"
                autoComplete="new-password"
                {...formik.getFieldProps(
                  htmlIds.input_setting_password_new_password_confirm,
                )}
              />
            </div>
          </form>
        </div>
        <div className="flex gap-3 mt-5 md:hidden w-full">
          <FormFooter
            submitBtnId={htmlIds.btn_setting_password_save}
            submitText={text("setting_password_privacy_save_button")}
            cancelText={text("setting_password_privacy_cancel_button")}
            handleClose={() => formik.resetForm()}
            onSubmit={() => formik.handleSubmit()}
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          />
        </div>
      </div>
    </div>
  );
});

export default SettingUpdatePasswordPanel;
