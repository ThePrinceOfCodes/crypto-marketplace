import { Spinner } from "@common/components";
import TextFieldInput from "@common/components/FormInputs/TextField";
import GoogleRecaptcha from "@common/components/GoogleRecaptcha";
import { useAuth } from "@common/context";
import { htmlIds } from "@cypress/utils/ids";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { Form, Formik } from "formik";
import { useLocale } from "locale";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useResetPassword } from "../../api/hooks";

function PageResetPassword() {
  const { text } = useLocale();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { mutateAsync: resetPassword } = useResetPassword();

  const recaptchaRef: React.MutableRefObject<ReCAPTCHA | null> = useRef(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token: any = router.query.resetPasswordToken || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    //ensure recaptcha is initialized.
    if (recaptchaRef.current) {
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        return toast.error(text("user_recaptcha_error"));
      }
    }

    if (!token) {
      toast("no token specified", { type: "error" });
      return false;
    }

    try {
      const { input_reest_password_page_password: newPassword } = data;
      await resetPassword({ newPassword, token });
      toast.success("Password changed successfuly");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err?.response?.data?.message, { type: "error" });
    } finally {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  if (isAuthenticated) {
    router.replace("/dashboard");
  }

  return (
    <div>
      <Head>
        <title>Reset Password - MSquare Admin</title>
      </Head>
      <main className="h-screen flex">
        <div className="w-1/2 hidden md:flex flex-col items-center justify-center px-5">
          <Image
            className="mx-auto mb-10"
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
        <div className="w-full md:w-1/2 flex items-center justify-center md:bg-blue-500 sm:p-3">
          <div className="min-w-72 w-96 bg-white p-10 rounded-lg">
            <div className="md:hidden">
              <Image
                className="mx-auto mb-10 pr-5"
                width={400}
                height={300}
                src="/images/logo.svg"
                alt="Msquare Market"
              />
            </div>

            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-8">
              Reset your password
            </h2>

            <Formik
              initialValues={{
                [htmlIds.input_reest_password_page_password]: "",
                [htmlIds.input_reest_password_page_confirm_password]: "",
              }}
              validationSchema={Yup.object({
                [htmlIds.input_reest_password_page_password]:
                  Yup.string().required("Password is required"),
                [htmlIds.input_reest_password_page_confirm_password]:
                  Yup.string()
                    .required("Confirm Password is required")
                    .oneOf(
                      [Yup.ref(htmlIds.input_reest_password_page_password), ""],
                      "Passwords do not match!",
                    ),
              })}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(async () => {
                  await onSubmit(values);
                  setSubmitting(false);
                  router.push("/login");
                }, 100);
              }}
              validateOnBlur={false}
            >
              {(formik) => (
                <Form>
                  <div className="mb-4">
                    <label
                      htmlFor={htmlIds.input_reest_password_page_password}
                      className="block mb-1 text-sm font-medium text-slate-500"
                    >
                      Password
                    </label>
                    <TextFieldInput
                      error={
                        formik.touched[
                          htmlIds.input_reest_password_page_password
                        ] &&
                        !!formik.errors[
                          htmlIds.input_reest_password_page_password
                        ]
                      }
                      helperText={
                        formik.touched[
                          htmlIds.input_reest_password_page_password
                        ] &&
                        formik.errors[
                          htmlIds.input_reest_password_page_password
                        ]
                      }
                      placeholder="Password"
                      type="password"
                      autoComplete="new-password"
                      {...formik.getFieldProps(
                        htmlIds.input_reest_password_page_password,
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor={
                        htmlIds.input_reest_password_page_confirm_password
                      }
                      className="block mb-1 text-sm font-medium text-slate-500"
                    >
                      Confirm Password
                    </label>
                    <TextFieldInput
                      error={
                        formik.touched[
                          htmlIds.input_reest_password_page_confirm_password
                        ] &&
                        !!formik.errors[
                          htmlIds.input_reest_password_page_confirm_password
                        ]
                      }
                      helperText={
                        formik.touched[
                          htmlIds.input_reest_password_page_confirm_password
                        ] &&
                        formik.errors[
                          htmlIds.input_reest_password_page_confirm_password
                        ]
                      }
                      placeholder="Confirm Password"
                      type="password"
                      {...formik.getFieldProps(
                        htmlIds.input_reest_password_page_confirm_password,
                      )}
                    />
                  </div>

                  <GoogleRecaptcha captchaRef={recaptchaRef} />

                  <div className="mb-4">
                    <button
                      id={htmlIds.btn_reset_password_page_reset}
                      type="submit"
                      className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      disabled={formik.isSubmitting}
                    >
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon
                          className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                          aria-hidden="true"
                        />
                      </span>
                      {formik.isSubmitting ? <Spinner /> : "Reset"}
                    </button>
                  </div>

                  <p className="text-sm font-semibold">
                    Already have an account?
                    <Link
                      id={htmlIds.btn_reset_password_page_login}
                      href="/login"
                      className="font-medium ml-1 text-indigo-600 hover:text-indigo-500"
                    >
                      Login
                    </Link>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageResetPassword;
