import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { InputText, Spinner } from "@common/components";
import { useAuth } from "@common/context";
import { useLocale } from "locale";
import { toast } from "react-toastify";
import { IOtpSectiontype } from "./types";
import GoogleRecaptcha from "@common/components/GoogleRecaptcha";
import ReCAPTCHA from "react-google-recaptcha";

const OtpSection = (props: IOtpSectiontype) => {
    const recaptchaRef: React.MutableRefObject<ReCAPTCHA | null> = useRef(null);

    const [isVerifyOtpLoading, setIsVerifyOtpLoading] = useState<boolean>(false);
    const [isResendOtpLoading, setIsResendOtpLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<boolean>(false);
    const [minutes, setMinutes] = useState<number>(3);
    const [seconds, setSeconds] = useState<number>(0);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const { text } = useLocale();
    const { resendOTP, verifyOTP } = useAuth();

    const email = props.email;

    useEffect(() => {
        setTimer(localStorage.getItem("timer") === "1");
        setMinutes(Number(localStorage.getItem("minutes")));
        setSeconds(Number(localStorage.getItem("seconds")));
    }, []);

    useEffect(() => {
        // eslint-disable-next-line no-undef
        let interval: string | number | NodeJS.Timer | undefined;
        if (timer) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                    localStorage.setItem("seconds", (seconds - 1).toString());
                }
                if (seconds === 0) {
                    if (minutes === 0) {
                        setTimer(false);
                        localStorage.setItem("timer", "0");
                        if (typeof interval === 'number' || typeof interval === 'undefined') {
                            clearInterval(interval as number);
                        }
                    } else {
                        localStorage.setItem("minutes", (minutes - 1).toString());
                        localStorage.setItem("seconds", (59).toString());
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                }
            }, 1000);
        } else {
            if (typeof interval === 'number' || typeof interval === 'undefined') {
                clearInterval(interval as number);
            }
        }
        return () => {
            if (typeof interval === 'number' || typeof interval === 'undefined') {
                clearInterval(interval as number);
            }
        };
    }, [minutes, seconds, timer]);

    const handleSendOTP = async () => {
        if (email) {
            if (recaptchaRef.current) {
                const recaptchaToken = await recaptchaRef.current.executeAsync();
                if (!recaptchaToken) {
                  return toast.error(text("user_recaptcha_error"));
                }
            }
            setIsResendOtpLoading(true);
            const res = await resendOTP(email as string);
            if (res) {
                setMinutes(1);
                setSeconds(0);
                setTimer(true);
                localStorage.setItem("timer", "1");
                localStorage.setItem("minutes", "3");
                localStorage.setItem("seconds", "0");
            } else {
                toast("Something went wrong Please try again later", {
                    type: "error",
                });
            }
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setIsResendOtpLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: { otp: string } | any) => {
        if (recaptchaRef.current) {
            const recaptchaToken = await recaptchaRef.current.executeAsync();
            if (!recaptchaToken) {
              return toast.error(text("user_recaptcha_error"));
            }
        }
        setIsVerifyOtpLoading(true);
        try {
            await verifyOTP({
                email: email as string,
                OTP: data?.otp,
                isLogin: true,
            });
            setTimer(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast(
                err?.response?.data?.message ||
                "Something went wrong Please try again later",
                {
                    type: "error",
                },
            );
        }
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setIsVerifyOtpLoading(false);
    };

    return (
        <div>
            <Head>
                <title>SMS authentication</title>
            </Head>
            <div className="w-96 bg-white p-10 rounded-lg">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    SMS authentication
                </h2>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 space-y-6"
                    action="#"
                    method="POST"
                >
                    <div className="flex flex-row items-center">
                        <button
                            onClick={() => handleSendOTP()}
                            disabled={timer}
                            type="button"
                            className={` mr-4 group relative flex w-20 h-10 justify-center items-center rounded-md border border-transparent ${!timer
                                ? "bg-indigo-600"
                                : "bg-indigo-300 disabled:pointer-events-none"
                                } text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        >
                            {isResendOtpLoading ? (
                                <Spinner />
                            ) : timer ? (
                                `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
                            ) : (
                                "Resend"
                            )}
                        </button>
                        <InputText
                            id="otp"
                            error={errors.email?.message}
                            isRequired={true}
                            {...register("otp", {
                                required: "OTP is required",
                            })}
                            className="w-full border mt-0 border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter OTP"
                        />
                    </div>
                    <span></span>
                    <GoogleRecaptcha captchaRef={recaptchaRef} />
                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {isVerifyOtpLoading ? (
                                <Spinner />
                            ) : (
                                <>
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LockClosedIcon
                                            className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    Verify
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpSection;
