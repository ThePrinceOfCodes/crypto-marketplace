import { Spinner } from "@common/components";
import { useAuth } from "@common/context";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useRef } from "react";
import useResponsive from "@common/hooks/useResponsive";
import { toast } from "react-toastify";
import { useResetPasswordRequest } from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import { LocalKeys, useLocale } from "locale";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import GoogleRecaptcha from "@common/components/GoogleRecaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { Form, Formik } from "formik";
import { Box } from "@mui/material";
import * as Yup from "yup";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { requiredEmailValidator } from "@common/utils/validationSchemas";
import clsx from "clsx";

function PageResetPasswordRequest() {
  const recaptchaRef: React.MutableRefObject<ReCAPTCHA | null> = useRef(null);
  const { text } = useLocale();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { mutateAsync: resetPassRequest, isLoading: submitting } =
    useResetPasswordRequest();
  const { isMobile, isDesktop } = useResponsive();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    //ensure recaptcha is initialized.
    if (recaptchaRef.current) {
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        return toast.error(text("user_recaptcha_error"));
      }
    }

    resetPassRequest({ email: data?.email })
      .then(() => {
        toast(`If an account exists, a reset link has been sent to ${data?.email}.`, { type: "success" });
      })
      .catch(() => {
        toast(`If an account exists, a reset link has been sent to ${data?.email}.`, { type: "success" });
      })
      .finally(() => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      });
  };

  if (isAuthenticated) {
    router.replace("/dashboard");
  }

  const initialValue = {
    email: "",
  };

  const validationSchema = () => {
    const email = requiredEmailValidator(
      ["email"],
      text("user_update_modal_tile_type_email_error"),
      text("form_error_required"),
    );

    return Yup.object().shape({
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
              Reset your password
            </h2>
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                onSubmit(values);
              }}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ errors, touched, setFieldError, setFieldValue }) => {

                return (
                  <Form>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", rowGap: 3, marginTop: 3 }}
                    >
                      <input type="hidden" name="remember" defaultValue="true" />
                      <div className="-space-y-px rounded-md">
                        <label
                          htmlFor={"email"}
                          className="block mb-2 text-sm font-medium text-slate-500"
                        >
                          {text("Email address" as LocalKeys)}{" "}
                        </label>
                        <TextFieldInput
                          id={htmlIds.input_login_email}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          placeholder={"Email address"}
                          onChange={(e) => {
                            setFieldValue("email", e.target.value);
                            if (touched.email) {
                              setFieldError("email", undefined);
                            }
                          }
                          }
                        />
                        <GoogleRecaptcha captchaRef={recaptchaRef} />
                      </div>
                      <div>
                        <button
                          id={htmlIds.btn_reset_password_request_page_reset}
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
                            "Reset"
                          )}

                        </button>
                        <div className="text-sm">
                          <p className="text-sm font-semibold mt-3 pt-1 mb-0">
                            Already have an account?
                            <Link
                              href={"/login"}
                              className="font-medium ml-1 text-indigo-600 hover:text-indigo-500"
                            >
                              Login
                            </Link>
                          </p>
                        </div>
                      </div>
                      {/* </form> */}
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageResetPasswordRequest;
