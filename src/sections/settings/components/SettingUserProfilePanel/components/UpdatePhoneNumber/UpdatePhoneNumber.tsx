import { Spinner } from "@common/components";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { useAuth } from "@common/context";
import { requiredAdminPhoneValidator } from "@common/utils/validationSchemas";
import { htmlIds } from "@cypress/utils/ids";
import { iPostOTPErr, usePostInitiatePhoneNumberUpdate } from "api/hooks";
import { Form, Formik, FormikProps } from "formik";
import { useLocale } from "locale";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

function UpdatePhoneNumber() {
  const { mutateAsync: getOTP, isLoading: getOTPLoading } =
    usePostInitiatePhoneNumberUpdate();
  const { user, verifyOTP } = useAuth();
  const [isOTPExpire, setIsOTPExpired] = useState<boolean>(false);
  const [timer, setTimer] = useState(150); // Initial time in seconds
  const [isOtpVerifyMode, setIsOtpVerifyMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setIsOTPExpired(true);
    }
  }, [timer]);

  //  Convert seconds to minutes and seconds
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const { text } = useLocale();

  const onSubmit = async (data: { phoneNumber: string; OTP: string }) => {
    try {
      const res = await verifyOTP({
        email: user?.email,
        phoneNumber: data.phoneNumber,
        OTP: data.OTP,
      });
      if (res) {
        toast.success("Verified successfully");
        setIsOTPExpired(false);
        setIsOtpVerifyMode(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        "Something went wrong Please try again later",
      );
    }
  };

  const requestPhoneNumberUpdate = async (phoneNumber: string) => {
    getOTP({
      phone_number: phoneNumber.substring(1),
    })
      .then((res) => {
        toast.success(res.status);
        setIsOTPExpired(false);
        setTimer(150);
        setIsOtpVerifyMode(true);
      })
      .catch((err: iPostOTPErr) => {
        toast.error(err?.response?.data.error);
      });
  };

  interface FormValues {
    [htmlIds.input_setting_user_number]: string;
    [htmlIds.input_setting_user_number_otp]: string;
  }

  const initialValues: FormValues = {
    [htmlIds.input_setting_user_number]: user?.phone_number
      ? `+${user.phone_number}`
      : "",
    [htmlIds.input_setting_user_number_otp]: "",
  };

  const validationSchema = () =>
    Yup.object({
      [htmlIds.input_setting_user_number]: requiredAdminPhoneValidator(text("form_error_admin_phone_required")),
      [htmlIds.input_setting_user_number_otp]: Yup.string().matches(
        /^\d{6}$/,
        text("setting_profile_verify_otp_length"),
      ),
    });

  return (
    <Formik
      className="flex flex-col"
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const {
          input_setting_user_number: phoneNumber,
          input_setting_user_number_otp: OTP,
        } = values;
        await onSubmit({ phoneNumber, OTP });
        setSubmitting(false);
      }}
      validateOnBlur={false}
    >
      {({
        values,
        errors,
        touched,
        getFieldProps,
        isSubmitting,
      }: FormikProps<FormValues>) => {
        const fieldProps = (field: keyof FormValues) => {
          const error = touched[field] && Boolean(errors[field]);
          const helperText = touched[field] && errors[field];

          return { id: field, error, helperText, ...getFieldProps(field) };
        };

        return (
          <Form className="flex">
            {!isOtpVerifyMode ? (
              <div className="flex flex-col gap-3 w-full lg:w-72">
                <TextFieldInput
                  placeholder={text("setting_profile_phoneNumber_name")}
                  label={text("setting_profile_phoneNumber_name")}
                  {...fieldProps(htmlIds.input_setting_user_number)}
                />
                <button
                  id={htmlIds.btn_setting_profile_request_otp}
                  type="button"
                  disabled={
                    getOTPLoading || !values[htmlIds.input_setting_user_number] || !!errors[htmlIds.input_setting_user_number]
                  }
                  className={`${getOTPLoading ||
                    !values[htmlIds.input_setting_user_number] ||
                    errors[htmlIds.input_setting_user_number]
                    ? "bg-blue-300"
                    : "bg-blue-500"
                    } w-full h-10 text-white rounded-md disabled:cursor-not-allowed`}
                  onClick={async () => {
                    if (errors[htmlIds.input_setting_user_number]) return;
                    requestPhoneNumberUpdate(
                      values[htmlIds.input_setting_user_number],
                    );
                  }}
                >
                  {getOTPLoading && <Spinner />}
                  {text("setting_profile_update_phone_number_button")}
                </button>
              </div>
            ) : (
              <div className="">
                <div className="flex items-start gap-2">
                  <div>
                    <button
                      onClick={() => {
                        if (errors[htmlIds.input_setting_user_number]) return;
                        requestPhoneNumberUpdate(
                          values[htmlIds.input_setting_user_number],
                        );
                      }
                      }
                      disabled={!isOTPExpire}
                      type="button"
                      className={`group relative flex w-20 h-11 justify-center items-center rounded-md border border-transparent ${isOTPExpire
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-indigo-300 disabled:pointer-events-none"
                        } text-sm font-medium text-white  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      {isOTPExpire
                        ? text("setting_profile_resend_OTP_button_text")
                        : `${minutes}:${seconds < 10 ? `0${seconds}` : seconds
                        }`}
                    </button>
                  </div>
                  <TextFieldInput
                    type="number"
                    label={text("setting_profile_verify_password_name")}
                    className={
                      touched[htmlIds.input_setting_user_number_otp] &&
                        Boolean(errors[htmlIds.input_setting_user_number_otp])
                        ? ""
                        : "mb-6"
                    }
                    {...fieldProps(htmlIds.input_setting_user_number_otp)}
                  />
                </div>
                <button
                  id={htmlIds.btn_setting_profile_verify_otp}
                  type="submit"
                  disabled={
                    isOTPExpire ||
                    isSubmitting ||
                    !values[htmlIds.input_setting_user_number_otp]
                  }
                  className={`w-full h-10 text-white rounded-md ${isOTPExpire ||
                    isSubmitting ||
                    !values[htmlIds.input_setting_user_number_otp]
                    ? "bg-indigo-200"
                    : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    text("setting_profile_verify_OTP_button")
                  )}
                </button>
              </div>
            )}
          </Form>
        );
      }}
    </Formik>
  );
}

export default UpdatePhoneNumber;
