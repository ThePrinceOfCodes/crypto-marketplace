import { useLocale } from "locale";
import Image from "next/image";

interface ErrorBoundaryUIProps {
  error: unknown
  resetErrorBoundary : ()=> void
}

const ErrorBoundaryUI = ({ error, resetErrorBoundary }:ErrorBoundaryUIProps ) => {
  const { text } = useLocale();
  console.error("send this to the backend", error);
  return (
    <div className="flex flex-col h-[80%] justify-center items-center">
      <div className="flex flex-col md:flex-row justify-center items-center w-full md:gap-10  ">
        <Image
          className="object-contain"
          width={300}
          height={300}
          alt="login"
          src="/images/img_login.png"
        />
        <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
          <h4 className="font-light text-6xl text-blue-300">Ooops!</h4>
          <h1 className="md:text-xl text-center text-gray-500 px-6 md:px-0">
            {text("page_client_error")}
          </h1>

          <button
            className="bg-blue-500 rounded-md px-4 h-10 text-white mt-2"
            onClick={resetErrorBoundary}
          >
            Try again?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryUI;
