import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { useAuth } from "@common/context";
import { htmlIds } from "@cypress/utils/ids";
import { queryClient } from "api";
import { useGetUserTokens } from "api/hooks";
import { usePostMutateTokenQuantity } from "api/hooks/transaction";
import { Form, Formik } from "formik";
import { useLocale } from "locale";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const TokenQuantityMutationModal: React.FC<{
  open: boolean;
  type: "add" | "remove";
  tokenName?: string;
  onClose: () => void;
}> = ({ open, type, onClose, tokenName }) => {
  const { text } = useLocale();
  const email = useRouter().query.email as string;
  const { user } = useAuth();

  const { mutateAsync: mutateTokenQuantity } = usePostMutateTokenQuantity();
  const { data: tokens } = useGetUserTokens({ email });
  const [currentTokenBalance, setCurrentTokenBalance] = useState<any>(null);

  useEffect(() => {
    if (tokens) {
      const foundToken = tokens.find((token: any) => token.name === tokenName);
      setCurrentTokenBalance(foundToken?.balance);
    }
  }, [tokens, tokenName, currentTokenBalance]);

  const handleSubmit = async ({
    amount,
    memoText,
  }: {
    amount: number;
    memoText: string;
  }) => {
    if (!tokenName) return toast.error(text("toast_error_token_name_is_not_defined"));
    try {
      const memoTextWithName = `${memoText} (${user?.name})`;
      await mutateTokenQuantity({
        type,
        amount,
        email,
        token: tokenName,
        memo: memoTextWithName,
      });
      queryClient.invalidateQueries(["user-tokens", email]);
      onClose();
      if (type === "add") {
        toast.success(text("setting_users_tokens_added_successfully"));
      } else if (type === "remove") {
        toast.success(text("setting_users_tokens_removed_successfully"));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  interface FormValues {
    [htmlIds.input_token_quantity_mutation_modal_amount]: string;
    [htmlIds.input_token_quantity_mutation_modal_memo]: string;
  }

  const initialValues: FormValues = {
    [htmlIds.input_token_quantity_mutation_modal_amount]: "",
    [htmlIds.input_token_quantity_mutation_modal_memo]: "",
  };

  const validationSchema = () =>
    Yup.object({
      [htmlIds.input_token_quantity_mutation_modal_amount]: Yup.number()
        .required(text("setting_users_free_tokens_dialog_amount_required"))
        .test(
          "is-greater-than-balance",
          text("setting_users_free_tokens_dialog_insufficient_funds"),
          value => (type === "remove" ? value <= currentTokenBalance : true)
        ),
      [htmlIds.input_token_quantity_mutation_modal_memo]: Yup.string().trim().required(
        text("setting_users_free_tokens_dialog_reason_required"),
      ),
    });

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text(`${type}_token_balance_modal_title`)}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleSubmit({
            amount: +values.input_token_quantity_mutation_modal_amount,
            memoText: values.input_token_quantity_mutation_modal_memo,
          });
          setSubmitting(false);
        }}
      >
        {({ errors, touched, getFieldProps, isSubmitting }) => {
          const fieldProps = (field: keyof FormValues) => {
            const error = touched[field] && Boolean(errors[field]);
            const helperText = touched[field] && errors[field];
            return { id: field, error, helperText, ...getFieldProps(field) };
          };

          return (
            <Form>
              <div className="flex flex-col gap-4 mt-2 mb-5">
                <TextFieldInput
                  type="number"
                  label={text(
                    "set_standard_amount_modal_enter_amount_placeholder",
                  )}
                  placeholder={text(
                    "set_standard_amount_modal_enter_amount_placeholder",
                  )}
                  {...fieldProps(
                    htmlIds.input_token_quantity_mutation_modal_amount,
                  )}
                />

                <TextFieldInput
                  label={text(
                    "setting_users_free_tokens_dialog_reason_placeholder",
                  )}
                  placeholder={text(
                    "setting_users_free_tokens_dialog_reason_placeholder",
                  )}
                  {...fieldProps(
                    htmlIds.input_token_quantity_mutation_modal_memo,
                  )}
                />
              </div>

              <div className="flex space-x-3">
                <FormFooter
                  submitBtnId={htmlIds.btn_token_quantity_mutation_modal_submit}
                  cancelBtnId={htmlIds.btn_token_quantity_mutation_modal_cancel}
                  submitText={text("add_platform_submit_btn_text")}
                  cancelText={text("add_platform_cancel_btn_text")}
                  handleClose={onClose}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
};

export default TokenQuantityMutationModal;
