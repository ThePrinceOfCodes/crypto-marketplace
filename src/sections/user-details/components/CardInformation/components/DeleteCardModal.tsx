import { Box } from "@mui/material";
import { useLocale } from "locale";
import { Dispatch, SetStateAction } from "react";
import { useDeleteUserCardDetails } from "api/hooks";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";

type DeleteCardModalProps = {
  open: boolean;
  email: string;
  id: string;
  code: string;
  toggleOpen: Dispatch<SetStateAction<boolean>>;
  onCancel: () => void;
};

export default function DeleteCardModal({open, email, id, code, toggleOpen, onCancel}:DeleteCardModalProps){
  const { text } = useLocale();

  const { mutateAsync: deleteUserCardDetails, isLoading: isDeleting } =
    useDeleteUserCardDetails();

  const validationSchemaDeleteCard = () =>
    Yup.object().shape({
      memoText: Yup.string().required(text("form_error_required")),
    });

  const handleDeletion = async (memoText: string) => {
    const requestBody = {
      email: email,
      card_id: id,
      company_code: code,
      memo: memoText,
    };

    try {
      await deleteUserCardDetails(requestBody);
      toast("Card information deleted successfully", {
        type: "success",
      });
      toggleOpen(false);
    } catch (error) {
      toast("An error occurred while deleting card information", {
        type: "error",
      });
      toggleOpen(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={text("user_details_delete_card_details")}
      className="custom-dialog-width-500"
    >
      <Formik
        validationSchema={validationSchemaDeleteCard()}
        initialValues={{ memoText: "" }}
        onSubmit={(values) => handleDeletion(values.memoText)}
        validateOnBlur={false}
      >
        {({ errors, touched, getFieldProps, setFieldValue }) => {
          function fieldProps(field: string) {
            //eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            const error = touched[field] && Boolean(errors[field]);
            //eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            const helperText = touched[field] && errors[field];
            return {
              error,
              helperText,
              setFieldValue,
              ...getFieldProps(field),
            };
          }

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <Box>
                  <TextFieldInput
                    id="card_details_deletion_memo"
                    placeholder={text("user_delete_reason_placeholder")}
                    {...fieldProps("memoText")}
                  />
                </Box>

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={onCancel}
                    loading={isDeleting}
                    cancelText={text("add_reserved_vault_cancel_title")}
                    submitText={text("add_reserved_vault_save")}
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

