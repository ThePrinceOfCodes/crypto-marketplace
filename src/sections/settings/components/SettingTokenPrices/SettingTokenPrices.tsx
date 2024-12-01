import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { htmlIds } from "@cypress/utils/ids";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Box,
  Button,
  CircularProgress,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { useAddFreeTokens, useGetAllTokens, useGetFreeTokens } from "api/hooks";
import { Form, Formik } from "formik";
import { useLocale } from "locale";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const SettingTokenPrices = () => {
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const { text } = useLocale();
  const { mutateAsync: addFreeTokens } = useAddFreeTokens();

  const {
    data: freeTokens,
    isLoading: loading,
    refetch: freeTokensRefetch,
  } = useGetFreeTokens({
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    onError: (err) => {
      toast(
        err?.response?.data?.message ||
        text("setting_users_free_tokens_toast_failed_to_get_free_tokens"),
        {
          type: "error",
        },
      );
    },
  });

  const { data: tokenDataList, isLoading: isTokenListLoading } =
    useGetAllTokens(
      {},
      {
        onError: (err) =>
          toast(
            err?.response?.data?.message ||
            text("setting_users_exchange_toast_error"),
            {
              type: "error",
            },
          ),
        cacheTime: 1000,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        select: (data) => {
          const newData = {
            ...data,
            allTokensData: data.allTokensData.filter((token) => !token.onChain),
          };
          return { ...newData };
        },
      },
    );
  const { allTokensData: userTokens } = tokenDataList || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: { token: string; amount: string }) => {
    try {
      await addFreeTokens(data);
      toast.success(
        text("setting_users_free_tokens_toast_add_new_token_successfully"),
      );
      freeTokensRefetch();
      setIsTokenDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (typeof err?.response?.data === "string")
        toast.error(err.response.data);
      else toast.error(err.response.data?.message);
    }
  };

  const handleTokenModalClose = () => {
    setIsTokenDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row platforms-header">
        <div className="md:w-64">
          <div className="text-xl"> {text("setting_users_tokens_title")}</div>
          <div className="text-slate-500 text-sm font-light">
            {text("setting_users_tokens_subtitle")}
          </div>
        </div>
        {loading ? (
          <Box
            sx={{
              marginLeft: "10%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "116px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-wrap md:gap-2">
              {freeTokens?.map((token) => (
                <div
                  className="flex flex-row gap-5 items-center border rounded-lg"
                  key={token.token}
                >
                  <div className="w-[200px] max-h-[60px] text-slate-500 text-sm font-medium break-words overflow-hidden text-ellipsis p-2 ellipsis">
                    {token.token}
                  </div>
                  <div className="w-[250px] flex items-center text-sm border-l pl-3 h-full">
                    {token.amount}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center mb-5">
              {isTokenListLoading ? (
                <CircularProgress />
              ) : (
                <Button
                  id={htmlIds.btn_setting_add_user_free_tokens}
                  variant="outlined"
                  startIcon={<PlusIcon className="w-5 stroke-2 mr-2" />}
                  onClick={() => setIsTokenDialogOpen(true)}
                >
                  {text("setting_users_add_free_tokens_button")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CustomDialog
        open={isTokenDialogOpen}
        onClose={handleTokenModalClose}
        titleText={text("setting_users_free_tokens_dialog_title")}
      >
        <Formik
          initialValues={{
            [htmlIds.select_setting_user_free_token_select]: "",
            [htmlIds.input_setting_user_free_token_amount]: "",
          }}
          validationSchema={Yup.object({
            [htmlIds.select_setting_user_free_token_select]:
              Yup.string().required(
                text("setting_users_free_tokens_dialog_token_name_required"),
              ),
            [htmlIds.input_setting_user_free_token_amount]:
              Yup.string().required(
                text("setting_users_free_tokens_dialog_amount_required"),
              ),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            const {
              select_setting_user_free_token_select: token,
              input_setting_user_free_token_amount: amount,
            } = values;
            await onSubmit({ token, amount });
            setSubmitting(false);
          }}
        >
          {({ errors, touched, getFieldProps, isSubmitting }) => {
            const fieldProps = (field: string) => {
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const error = touched[field] && Boolean(errors[field]);
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const helperText = touched[field] && errors[field];

              return { id: field, error, helperText, ...getFieldProps(field) };
            };

            return (
              <Form>
                <div className="flex flex-col gap-4 my-3 mb-5">
                  <SelectField
                    variant="outlined"
                    label={text(
                      "setting_users_free_tokens_dialog_selected_token",
                    )}
                    {...fieldProps(
                      htmlIds.select_setting_user_free_token_select,
                    )}
                  >
                    {userTokens?.map((token) => (
                      <MenuItem
                        className="text-xs text-neutral-500 max-w-[375px]"
                        key={token.name}
                        value={token.name}
                      >
                        <ListItemText
                          classes={{
                            primary: "truncate",
                          }}
                          className="text-xs"
                          primary={token.name}
                        />
                      </MenuItem>
                    ))}
                  </SelectField>

                  <TextFieldInput
                    type="number"
                    label={text("setting_users_free_tokens_dialog_amount")}
                    placeholder={text(
                      "setting_users_free_tokens_dialog_amount_placeholder",
                    )}
                    {...fieldProps(
                      htmlIds.input_setting_user_free_token_amount,
                    )}
                  />
                </div>

                <div className="flex space-x-3">
                  <FormFooter
                    loading={isSubmitting}
                    handleClose={handleTokenModalClose}
                    submitText={text(
                      "setting_users_free_tokens_dialog_submit_button",
                    )}
                    cancelText={text(
                      "setting_users_free_tokens_dialog_cancel_button",
                    )}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </CustomDialog>
    </>
  );
};

export default SettingTokenPrices;
