import { useLocale } from "locale";
import Image from "next/image";
import { useRouter } from "next/router";

const NotFoundPage = () => {
  const { text } = useLocale();
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col h-[80%] justify-center items-center">
        <div className="flex flex-col md:flex-row justify-center items-center w-full gap-10">
          <Image
            className="object-contain"
            width={300}
            height={300}
            alt="login"
            src="/images/img_login.png"
          />
          <div>
            <h4 className="font-light text-6xl text-blue-300">Ooops!</h4>
            <h1 className="text-xl  text-gray-500">
              <span className="font-semibold">&nbsp; {text("404_text")} |</span>
              {text("page_not_found")}
            </h1>

            <button
              className="bg-blue-500 rounded-md px-4 h-10 text-white mt-2"
              onClick={() => router.back()}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
