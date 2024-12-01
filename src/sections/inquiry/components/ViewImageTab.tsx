import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLocale } from "locale";
import { Spinner } from "@common/components";
import { extractPathFromUrl } from "@common/utils/helpers";
import { CustomImage } from "@common/components/CustomImage";

const PDFView = dynamic(() => import("../../user-details/components/ViewFilesModal/components/PDFView/PDFView"), {
    ssr: false,
});

type IViewImageTab = {
    files?: {
        file_name: string;
        file_url?: string;
    }[]
}

export default function ViewImageTab({ files }: IViewImageTab) {
    const [loading, setLoading] = useState(false);
    const { text } = useLocale();

    const downloadFiles = async () => {
        try {
            setLoading(true);
            if (files) {
                await Promise.all(
                    files.map(async (item) => {
                        if (item.file_url) {
                            const url = process.env.API_BASE_URL?.includes("dev")
                                ? ` https://dev-static.msq.market${extractPathFromUrl(item.file_url)}`
                                : process.env.API_BASE_URL?.includes("stg")
                                    ? ` https://stg-static.msq.market${extractPathFromUrl(item.file_url)}`
                                    : "https://static.msq.market" + extractPathFromUrl(item.file_url);
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const urlObject = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = urlObject;
                            link.download = `${item.file_name}.${item.file_url.split(".")[item.file_url.split(".").length - 1]
                                }`; // Specify the desired file name
                            link.click();
                            URL.revokeObjectURL(urlObject);
                        }
                    }),
                );
            }
        } catch (error) {
            //
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {files && files.map(
                (item) =>
                    item.file_url &&
                    (item.file_url.endsWith(".pdf") ? (
                        <PDFView file={item.file_url} key={item.file_name} />
                    ) : (
                        <CustomImage
                            src={item.file_url}
                            width={500}
                            height={400}
                            alt={item.file_name}
                            key={item.file_name}
                            className="h-auto object-cover"

                        />
                    )),
            )}

            <div className="flex mt-3 gap-2 justify-center">
                <button
                    className="mr-1 rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={downloadFiles}
                >
                    {loading && <Spinner />}
                    {text("users_view_files_downdload_files")}
                </button>
            </div>
        </div>
    );
}