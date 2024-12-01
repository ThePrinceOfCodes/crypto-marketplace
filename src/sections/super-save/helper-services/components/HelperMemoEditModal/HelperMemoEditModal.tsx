import { Box } from "@mui/material";
import * as Yup from "yup";
import { Form, Formik } from "formik";

import { useLocale } from "locale";
import { useEditHelperService } from "api/hooks";
import { useDialog } from "@common/context";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import { toast } from "react-toastify";

const HelperMemoEditModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  memo: string;
  id: string;
  title: string
}> = ({ open, handleClose, handleSubmit, id, memo: _memo, title }) => {
  const { alertDialog } = useDialog();
  const { text } = useLocale();

  const { mutateAsync: editMemo, isLoading } = useEditHelperService();

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["memo"],
      text("form_error_required"),
    );

    return Yup.object().shape({ ...string_v });
  };

  const onSubmit = async (values: { memo: string }) => {
    const { memo } = values;
    await editMemo(
      { id, memo },
      {
        onSuccess: () => {
          alertDialog({
            title: text("super_save_helper_services_memo_updated"),
          });
          handleClose();
          handleSubmit();
        },
        onError: (error: any) => {
          toast(error.response?.data?.message, {
            type: "error",
          });
        }
      },
    );
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={title}
    >
      <Formik
        onSubmit={onSubmit}
        initialValues={{ memo :_memo }}
        validationSchema={validationSchema()}
      >
        {({ touched, errors, getFieldProps }) => (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2}}>
              <TextFieldInput
                error={touched["memo"] && Boolean(errors["memo"])}
                helperText={touched["memo"] && errors["memo"]}
                placeholder={text("placeholder_memo")}
                label={text("placeholder_memo")}
                multiline
                rows={4}
                {...getFieldProps("memo")}
              />
              <Box sx={{ display: "flex", columnGap: 2 }}>
                <FormFooter
                  handleClose={handleClose}
                  loading={isLoading}
                  cancelText={text("add_edit_memo_cancel_title")}
                  submitText={text("add_edit_memo_save_title")}
                 />
               </Box>
            </Box>
          </Form>
         )}
      </Formik>
    </CustomDialog>
  );
};

export default HelperMemoEditModal;