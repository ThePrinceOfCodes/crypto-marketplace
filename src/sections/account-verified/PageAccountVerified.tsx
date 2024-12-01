import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "@common/context";
import { useLazyGetVerifyAccount } from "api/hooks";

function PageAccountVerified() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [verificationStarted, setVerificationStarted] = useState(true);

  if (isAuthenticated) {
    router.replace("/dashboard");
  }

  const [verifyAccount, { isSuccess, isFetching }] = useLazyGetVerifyAccount(
    { token },
    {
      onSuccess: () => {
        toast("account verified successfully", { type: "success" }),
          setVerificationStarted(false);
      },
      onError: (err) => {
        toast(err.response?.data.message, { type: "error" }),
          setVerificationStarted(false);
      },
    },
  );

  useEffect(() => {
    if (!router.query.validationToken) {
      //router.push('/login')
    } else {
      setToken(router.query.validationToken as string);
      verifyAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.validationToken]);

  const renderVerificationStatus = () => {
    if (verificationStarted) {
      return "Waiting...";
    }
    if (isFetching) {
      return "Waiting...";
    }

    return isSuccess ? "Account successfully verified" : "Invalid Token";
  };

  return (
    <div>
      <Head>
        <title>Register success</title>
      </Head>
      <main className="h-screen flex">
        <div className="w-1/2 flex flex-col items-center justify-center">
          <Image
            className="mx-auto mb-10 "
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
        <div className="w-1/2 flex flex-col items-center justify-center bg-blue-500">
          <div className="w-96 bg-white p-10 rounded-lg">
            <h2 className=" text-center text-2xl font-bold tracking-tight text-gray-900">
              {renderVerificationStatus()}
            </h2>

            <div className="flex items-center justify-center text-sm">
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 flex justify-center w-[60px]"
              >
                Login?
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageAccountVerified;
