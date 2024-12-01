import { useAuth } from "@common/context";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

function PageVerifyAccount() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.replace("/dashboard");
  }

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
        <div className="w-1/2 flex items-center justify-center bg-blue-500">
          <div className="w-96 bg-white p-10 rounded-lg">
            <h2 className=" text-center text-3xl font-bold tracking-tight text-gray-900">
              Verify your account
            </h2>
            {
              <span className="text-sm font-semibold mt-3 pt-1 mb-0 flex justify-center">
                Check your email to verify your account
              </span>
            }
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageVerifyAccount;
