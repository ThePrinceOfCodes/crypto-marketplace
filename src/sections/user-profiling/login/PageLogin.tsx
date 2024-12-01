import useResponsive from "@common/hooks/useResponsive";
import clsx from "clsx";
import Head from "next/head";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { OtpSection, Spinner } from "@common/components";
import { useAuth } from "@common/context";
import { LocalKeys, useLocale } from "../../../locale";
import { htmlIds } from "@cypress/utils/ids";
import GoogleRecaptcha from "@common/components/GoogleRecaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { Form, Formik } from "formik";
import { Box } from "@mui/material";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";
import { requiredEmailValidator } from "@common/utils/validationSchemas";

function PageLogin() {
  const recaptchaRef: React.MutableRefObject<ReCAPTCHA | null> = useRef(null);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const { login } = useAuth();
  const { isDesktop, isMobile } = useResponsive();
  const [submitting, setSubmitting] = useState(false);
  const { text } = useLocale();
  const [otpVerifyEmail, setOtpVerifyEmail] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setOtpVerifyEmail(data.email);
    setSubmitting(true);
    if (recaptchaRef.current) {
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        setSubmitting(false);
        return toast.error(text("user_recaptcha_error"));
      }
    }
    login(data.email, data.password)
      .then((loginRespnse) => {
        if (loginRespnse.verifyOtp) {
          setShowVerifyOtp(true);
          return;
        }
        toast.success(text("user_login_success"));
      })
      .catch((err) => {
        toast(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          text("user_login_error"),
          { type: "error" },
        );
      })
      .finally(() => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }

        setSubmitting(false);
      });
  };

  const initialValues = {
    email: null,
    password: null,
  };

  const validationSchema = () => {
    const email = requiredEmailValidator(
      ["email"],
      text("user_update_modal_tile_type_email_error"),
      text("form_error_required"),
    );

    return Yup.object().shape({
      password: Yup.string().required("Password is required"),
      ...email
    });
  };

  return (
    <div>
      <Head>
        <title>Login - MSquare Admin</title>
      </Head>
      <main
        className={clsx(
          "h-screen flex",
          isMobile ? "flex-col justify-center" : "",
        )}
      >
        {isDesktop && (
          <div className="w-1/2 flex flex-col items-center justify-center">
            <Image
              className="mx-auto mb-10 pr-8 "
              width={400}
              height={300}
              src="/images/logo.svg"
              alt="Msquare Market"
            />
            <Image
              className="object-contain"
              width={400}
              height={400}
              alt="login"
              src="/images/img_login.png"
            />
          </div>
        )}
        <div
          className={clsx(
            "flex items-center justify-center",
            isDesktop ? "w-1/2 bg-blue-500" : "",
          )}
        >
          {showVerifyOtp ? (
            <OtpSection email={otpVerifyEmail} />
          ) : (
            <div
              className={clsx(
                "bg-white rounded-lg",
                isDesktop ? "w-96 p-10" : "w-[100%] px-10",
              )}
            >
              {isMobile && (
                <Image
                  className="mx-auto mb-5 pr-5"
                  width={300}
                  height={200}
                  src="/images/logo.svg"
                  alt="Msquare Market"
                />
              )}
              <h2 className=" text-center text-3xl font-bold tracking-tight text-gray-900">
                Sign in to your <br /> account
              </h2>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => {
                  onSubmit(values);
                }}
                validateOnBlur={false}
                validateOnChange={false}
              >
                {({ errors, touched, setFieldValue, setFieldError }) => {

                  return (
                    <Form autoFocus>
                      <Box
                        sx={{ display: "flex", flexDirection: "column", rowGap: 3, marginTop: 4, gap: 2 }}
                      >
                        <input type="hidden" name="remember" defaultValue="true" />
                        <div className="space-y-5">
                          <div>
                            <label
                              htmlFor="email"
                              className="block mb-1 text-sm font-medium text-slate-500"
                            >
                              {text("Email address" as LocalKeys)}

                            </label>
                            <TextFieldInput
                              id={htmlIds.input_login_email}
                              error={touched.email && Boolean(errors.email)}
                              helperText={touched.email && errors.email}
                              placeholder="Email address"
                              onChange={(e) => {
                                setFieldValue("email", e.target.value as string);
                                setFieldError("email", undefined);
                              }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="password"
                              className="block mb-1  text-sm font-medium text-slate-500"
                            >
                              {text("Password" as LocalKeys)}

                            </label>
                            <TextFieldInput
                              id={htmlIds.input_login_password}
                              error={touched.password && Boolean(errors.password)}
                              helperText={touched.password && errors.password}
                              placeholder="Password"
                              onChange={(e) => {
                                setFieldValue("password", e.target.value);
                                setFieldError("password", undefined);
                              }}
                              type="password"

                            />
                          </div>
                          <GoogleRecaptcha captchaRef={recaptchaRef} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id={htmlIds.checkbox_login_remember_me}
                              name="remember-me"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={htmlIds.checkbox_login_remember_me}
                              className="ml-2 block text-sm text-gray-900"
                            >
                              Remember me
                            </label>
                          </div>

                          <div className="text-sm">
                            <Link
                              id={htmlIds.btn_login_forgot_password}
                              href="/reset-password-request"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Forgot your password?
                            </Link>
                          </div>
                        </div>

                        <div>
                          <button
                            id={htmlIds.btn_login_sign_in}
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={submitting}
                          >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <LockClosedIcon
                                className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                aria-hidden="true"
                              />
                            </span>
                            {submitting ? (
                              <Spinner className={"my-[3px]"} />
                            ) : (
                              "Sign In"
                            )}
                          </button>
                          <div className="text-sm">
                            <p className="text-sm font-semibold mt-3 pt-1 mb-0">
                              Don&apos;t have an account?
                              <Link
                                id={htmlIds.btn_login_register}
                                href="/signup"
                                className="font-medium ml-1 text-indigo-600 hover:text-indigo-500"
                              >
                                Register
                              </Link>
                            </p>
                          </div>
                        </div>
                      </Box>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PageLogin;
