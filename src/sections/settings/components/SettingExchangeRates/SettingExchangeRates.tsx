import CustomDialog from "@common/components/CustomDialog";
import { htmlIds } from "@cypress/utils/ids";
import { PlusIcon } from "@heroicons/react/24/outline";
import * as Yup from "yup";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import {
  Box,
  Button,
  CircularProgress,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  useAddTokenExchangeRate,
  useGetAllTokens,
  useGetTokensExchangeRates,
} from "api/hooks";
import { Form, Formik } from "formik";
import { useLocale } from "locale";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

interface ExchangeRate {
  uuid?: string;
  source_token_name: string;
  source_token_price: string;
  target_token_name: string;
  target_token_price: string;
}

const SettingExchangeRates = () => {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const {
    data: exchangeRates,
    isLoading: loading,
    refetch: exchangeRefetch,
  } = useGetTokensExchangeRates({
    onError: (err) =>
      toast(
        err?.response?.data.message ||
        text("setting_users_exchange_toast_failed_to_get_exchange_rate"),
        {
          type: "error",
        },
      ),
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { text } = useLocale();

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
      },
    );

  const { allTokensData: tokens } = tokenDataList || {};

  const { mutateAsync: addTokenExchangeRate } = useAddTokenExchangeRate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: ExchangeRate) => {
    const {
      source_token_name,
      source_token_price,
      target_token_name,
      target_token_price,
    } = data;

    try {
      await addTokenExchangeRate(
        {
          source_token_name,
          source_token_price: +source_token_price,
          target_token_name,
          target_token_price: +target_token_price,
        },
        {
          onSuccess: async () => {
            await exchangeRefetch();
            toast.success(
              text(
                "setting_users_exchange_toast_exchange_rate_added_successfully",
              ),
            );
          },
          onError: (err) => {
            toast.error(err?.response?.data.message);
          },
        },
      );

      setIsExchangeModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  const handleExchangeModalClose = () => {
    setIsExchangeModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row platforms-header mt-5">
        <div className="flex flex-col">
          <div className="text-xl">{text("setting_users_exchange_title")}</div>
          <div className="text-slate-500 text-sm w-60">
            {text("setting_users_exchange_subtitle")}
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
          <div className="flex flex-col md:ml-5">
            <div className="input-section justify-center md:justify-start gap-4">
              {exchangeRates?.map((rate: ExchangeRate) => (
                <div
                  className="flex flex-row gap-4 p-2 mt-4 md:mt-2 items-center border border-gray-300 rounded-lg bg-white justify-around "
                  key={rate.uuid}
                >
                  <div className="md:w-80 w-[160px] flex gap-2 justify-center">
                    <Tooltip
                      title={rate.source_token_name}
                      disableHoverListener={rate.target_token_name.length < 20}
                    >
                      <div className="flex justify-center items-center text-slate-500 text-sm text-ellipsis  truncate">
                        <span className="text-ellipsis truncate">
                          {rate.source_token_name}
                        </span>
                      </div>
                    </Tooltip>
                    <div className="flex justify-left items-center text-sm font-medium text-gray-900">
                      {rate.source_token_price}
                    </div>
                  </div>
                  <Image
                    width={20}
                    height={20}
                    src="/images/double-arrows.svg"
                    alt="icon"
                  />
                  <div className="md:w-80 w-[160px] flex md:gap-2 justify-center">
                    <Tooltip
                      title={rate.target_token_name}
                      disableHoverListener={rate.target_token_name.length < 20}
                    >
                      <div className="flex justify-center items-center text-slate-500 text-sm truncate">
                        <span className="text-ellipsis truncate">
                          {rate.target_token_name}
                        </span>
                      </div>
                    </Tooltip>
                    <div className="flex justify-left items-center text-sm font-medium text-gray-900">
                      {rate.target_token_price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center mb-5">
              {isTokenListLoading ? (
                <CircularProgress />
              ) : (
                <Button
                  id={htmlIds.btn_setting_add_user_add_tokens}
                  variant="outlined"
                  startIcon={<PlusIcon className="w-5 stroke-2 mr-2" />}
                  onClick={() => setIsExchangeModalOpen(true)}
                >
                  {text("setting_users_exchange_add_token_button")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CustomDialog
        open={isExchangeModalOpen}
        onClose={handleExchangeModalClose}
        titleText={text("setting_users_exchange_dialog_title")}
      >
        <Formik
          initialValues={{
            [htmlIds.select_setting_user_exchange_rate_from_token]: "",
            [htmlIds.input_setting_user_exchange_rate_from_price]: "",
            [htmlIds.select_setting_user_exchange_rate_to_token]: "",
            [htmlIds.input_setting_user_exchange_rate_to_price]: "",
          }}
          validationSchema={Yup.object({
            [htmlIds.select_setting_user_exchange_rate_from_token]:
              Yup.string().required(
                text("setting_users_exchange_dialog_token_name_required"),
              ),
            [htmlIds.input_setting_user_exchange_rate_from_price]:
              Yup.string().required(
                text("setting_users_exchange_dialog_price_required"),
              ),
            [htmlIds.select_setting_user_exchange_rate_to_token]:
              Yup.string().required(
                text("setting_users_exchange_dialog_token_name_required"),
              ),
            [htmlIds.input_setting_user_exchange_rate_to_price]:
              Yup.string().required(
                text("setting_users_exchange_dialog_price_required"),
              ),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            const {
              select_setting_user_exchange_rate_from_token: source_token_name,
              input_setting_user_exchange_rate_from_price: source_token_price,
              select_setting_user_exchange_rate_to_token: target_token_name,
              input_setting_user_exchange_rate_to_price: target_token_price,
            } = values;

            await onSubmit({
              source_token_name,
              source_token_price,
              target_token_name,
              target_token_price,
            });
            setSubmitting(false);
          }}
        >
          {({ values, errors, touched, getFieldProps, isSubmitting }) => {
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
              <Form className="flex flex-col gap-2">
                <h2 className="text-gray-500 font-medium">
                  {text("setting_users_exchange_dialog_from")}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-[70%]">
                    <SelectField
                      variant="outlined"
                      label={text("setting_users_exchange_dialog_select_token")}
                      {...fieldProps(
                        htmlIds.select_setting_user_exchange_rate_from_token,
                      )}
                    >
                      {tokens
                        ?.filter(
                          (token) =>
                            token.name !==
                            values[
                            htmlIds.select_setting_user_exchange_rate_to_token
                            ],
                        )
                        .map((token) => (
                          <MenuItem
                            className="text-xs text-neutral-500"
                            key={token.name}
                            value={token.name}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={token.name}
                            />
                          </MenuItem>
                        ))}
                    </SelectField>
                  </div>
                  <div>
                    <TextFieldInput
                      label={text("setting_users_exchange_dialog_input_price")}
                      placeholder={text(
                        "setting_users_exchange_dialog_input_price",
                      )}
                      type="number"
                      {...fieldProps(
                        htmlIds.input_setting_user_exchange_rate_from_price,
                      )}
                    />
                  </div>
                </div>

                <h2 className="text-gray-500 font-medium">
                  {text("setting_users_exchange_dialog_to")}
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="sm:w-[70%]">
                    <SelectField
                      variant="outlined"
                      label={text("setting_users_exchange_dialog_select_token")}
                      {...fieldProps(
                        htmlIds.select_setting_user_exchange_rate_to_token,
                      )}
                    >
                      {tokens
                        ?.filter(
                          (token) =>
                            token.name !==
                            values[
                            htmlIds
                              .select_setting_user_exchange_rate_from_token
                            ],
                        )
                        .map((token) => (
                          <MenuItem
                            className="text-xs text-neutral-500"
                            key={token.name}
                            value={token.name}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={token.name}
                            />
                          </MenuItem>
                        ))}
                    </SelectField>
                  </div>

                  <div>
                    <TextFieldInput
                      label={text("setting_users_exchange_dialog_input_price")}
                      placeholder={text(
                        "setting_users_exchange_dialog_input_price",
                      )}
                      type="number"
                      {...fieldProps(
                        htmlIds.input_setting_user_exchange_rate_to_price,
                      )}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <FormFooter
                    loading={isSubmitting}
                    handleClose={handleExchangeModalClose}
                    cancelText={text(
                      "setting_users_exchange_dialog_cancel_button",
                    )}
                    submitText={text(
                      "setting_users_exchange_dialog_submit_button",
                    )}
                    submitBtnId={htmlIds.btn_setting_user_exchange_rate_submit}
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

export default SettingExchangeRates;
