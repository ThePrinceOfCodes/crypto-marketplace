import * as Yup from "yup";
import { htmlIds } from "@cypress/utils/ids";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useLocale } from "locale";
import {
  iPostAddMultiAdminPlatformErr,
  usePostAddMultiAdminPlatform,
} from "api/hooks";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import { requiredEmailValidator } from "@common/utils/validationSchemas";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import CustomDialog from "@common/components/CustomDialog";

interface buttonAddTokenProps {
  onAdded?: () => void;
}

const PDAddAdminButton = (props: buttonAddTokenProps) => {
  const { text } = useLocale();
  const { onAdded } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformId: any = router.query.platform || "";

  const { mutateAsync: postAddMultiAdminPlatform, isLoading } =
    usePostAddMultiAdminPlatform();

    const validationSchema = () => {  
      const email = requiredEmailValidator(
        ["email"],
        text("user_update_modal_tile_type_email_error"),
        text("form_error_required"),
      );
      return Yup.object().shape({ ...email });
    };
  
  const onSubmit = async (data: { email: string }) => {
    postAddMultiAdminPlatform({
      id: platformId,
      email: data.email,
    })
      .then(() => {
        toast(text("mutiple_admins_add_new_admin_success"), {
          type: "success",
        });
        setOpen(false);
        onAdded?.();
      })
      .catch((err: iPostAddMultiAdminPlatformErr) => {
        toast(err.response?.data.status, { type: "error" });
      });
  };

  return (
    <div>
      <button
        id={htmlIds.btn_platform_details_admins_add_new_admin}
        className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md text-nowrap"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span>{text("mutiple_admins_add_new_admin_title")}</span>
      </button>

      <CustomDialog
        open={open}
        onClose={() => setOpen(false)}
        titleText={text("mutiple_admins_add_new_admin_btn")}
      >
        <Formik
          onSubmit={(values) => onSubmit(values)}
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
        >
          {({ getFieldProps, touched, errors }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <TextFieldInput
                  placeholder={text("add_new_admin_email_placeholder")}
                  label={text("add_new_admin_email")}
                  error={touched["email"] && Boolean(errors["email"])}
                  helperText={touched["email"] && errors["email"]}
                  {...getFieldProps("email")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={() => setOpen(false)}
                    loading={isLoading}
                    cancelText={text("add_new_admin_cancel")}
                    submitText={text("add_new_admin_submit")}
                  />
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </CustomDialog>
    </div>
  );
};

export default PDAddAdminButton;
