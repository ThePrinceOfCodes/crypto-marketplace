import { Spinner } from "@common/components";
import TextFieldInput from "@common/components/FormInputs/TextField";
import GoogleRecaptcha from "@common/components/GoogleRecaptcha";
import { useAuth } from "@common/context";
import useResponsive from "@common/hooks/useResponsive";
import { requiredEmailValidator } from "@common/utils/validationSchemas";
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
import clsx from "clsx";

function PageRegister() {
  const { text } = useLocale();
  const { signup, isAuthenticated } = useAuth();
  const router = useRouter();
  const recaptchaRef: React.MutableRefObject<ReCAPTCHA | null> = useRef(null);
  const { isMobile, isDesktop } = useResponsive();
  
  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (recaptchaRef.current) {
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        return toast.error(text("user_recaptcha_error"));
      }
    }

    try {
      const { name, email, password } = data;
      await signup(name, email, password);
      toast.success("Registration successful");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  if (isAuthenticated) router.replace("/");

  interface FormValues {
    [htmlIds.input_signup_name]: string;
    [htmlIds.input_signup_email]: string;
    [htmlIds.input_signup_password]: string;
    [htmlIds.input_signup_confirm_password]: string;
    [htmlIds.checkbox_signup_terms_condition]: boolean;
  }

  const initialValues: FormValues = {
    [htmlIds.input_signup_name]: "",
    [htmlIds.input_signup_email]: "",
    [htmlIds.input_signup_password]: "",
    [htmlIds.input_signup_confirm_password]: "",
    [htmlIds.checkbox_signup_terms_condition]: false,
  };

  const validationSchema = () => {
    const email = requiredEmailValidator(
      [htmlIds.input_signup_email],
      text("user_update_modal_tile_type_email_error"),
      text("form_error_required"),
    );

    return Yup.object().shape({
      [htmlIds.input_signup_name]: Yup.string().required("Name is required"),
      [htmlIds.input_signup_password]: Yup.string().required(
        "Password is required",
      ),
      [htmlIds.input_signup_confirm_password]: Yup.string()
        .required("Confirm Password is required")
        .oneOf(
          [Yup.ref(htmlIds.input_signup_password), ""],
          "Your passwords do not match",
        ),
      [htmlIds.checkbox_signup_terms_condition]: Yup.boolean()
        .required("acceptTerms")
        .isTrue(),
      ...email
    });
  };

  return (
    <div>
      <Head>
        <title>Register - MSquare Admin</title>
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
              className="mx-auto mb-10 pr-8"
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
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-8">
              Create an account
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const {
                  input_signup_name: name,
                  input_signup_email: email,
                  input_signup_password: password,
                } = values;
                await onSubmit({ name, email, password });
                setSubmitting(false);
              }}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({
                errors,
                touched,
                getFieldProps,
                isSubmitting,
                setFieldTouched,
                setFieldError,
              }) => {
                const fieldProps = (field: keyof FormValues) => {
                  const error = touched[field] && Boolean(errors[field]);
                  const helperText = touched[field] && errors[field];

                  return {
                    id: field,
                    error,
                    helperText,
                    ...getFieldProps(field),
                  };
                };

                return (
                  <Form className="flex flex-col gap-3">
                    <div>
                      <label
                        htmlFor={htmlIds.input_signup_name}
                        className="block mb-1 text-sm font-medium text-slate-500"
                      >
                        Name
                      </label>
                      <TextFieldInput
                        placeholder="Name"
                        {...fieldProps(htmlIds.input_signup_name)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={htmlIds.input_signup_email}
                        className="block mb-1 text-sm font-medium text-slate-500"
                      >
                        Email address
                      </label>
                      <TextFieldInput
                        placeholder="Email address"
                        {...fieldProps(htmlIds.input_signup_email)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={htmlIds.input_signup_password}
                        className="block mb-1 text-sm font-medium text-slate-500"
                      >
                        Password
                      </label>
                      <TextFieldInput
                        placeholder="Password"
                        type="password"
                        autoComplete="new-password"
                        {...fieldProps(htmlIds.input_signup_password)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={htmlIds.input_signup_confirm_password}
                        className="block mb-1 text-sm font-medium text-slate-500"
                      >
                        Confirm Password
                      </label>
                      <TextFieldInput
                        placeholder="Confirm Password"
                        type="password"
                        autoComplete="new-password"
                        {...fieldProps(htmlIds.input_signup_confirm_password)}
                      />
                    </div>

                    <GoogleRecaptcha captchaRef={recaptchaRef} />

                    <div className="flex items-center mb-3">
                      <input
                        id={htmlIds.checkbox_signup_terms_condition}
                        type="checkbox"
                        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 ${errors[htmlIds.checkbox_signup_terms_condition]
                            ? "ring-indigo-500 border-indigo-500 ring-2 ring-offset-2"
                            : " focus:ring-indigo-500"
                          } `}
                        {...getFieldProps(
                          htmlIds.checkbox_signup_terms_condition,
                        )}
                        onBlur={() => {
                          setFieldTouched(
                            htmlIds.checkbox_signup_terms_condition,
                            false,
                          );
                          setFieldError(
                            htmlIds.checkbox_signup_terms_condition,
                            undefined,
                          );
                        }}
                      />
                      <label
                        htmlFor={htmlIds.checkbox_signup_terms_condition}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        I accept terms & conditions
                      </label>
                    </div>

                    <button
                      id={htmlIds.btn_signup_sign_up}
                      type="submit"
                      className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon
                          className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                          aria-hidden="true"
                        />
                      </span>
                      {isSubmitting ? (
                        <Spinner className={"my-[3px]"} />
                      ) : (
                        "Sign Up"
                      )}
                    </button>

                    <p className="text-sm font-semibold mb-0">
                      Already have an account?
                      <Link
                        id={htmlIds.btn_signup_login_here}
                        href="/login"
                        className="font-medium ml-1 text-indigo-600 hover:text-indigo-500"
                      >
                        Login here
                      </Link>
                    </p>
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

export default PageRegister;
