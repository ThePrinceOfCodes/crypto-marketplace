import { useLocale } from "locale";
import React from "react";
import Link from "next/link";

const CommunityLinkButtons = () => {
    const { text } = useLocale();
    return (
        <div className="flex gap-2  flex-col lg:flex-row ">
            <Link href={"/users/community"} >
                <button className="flex items-center justify-center text-sm px-4  py-2.5 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed ">
                    {text("community_management")}
                </button>
            </Link>
            <Link href={"/users/community/status"} >
                <button className="flex items-center justify-center text-sm px-4  py-2.5 bg-blue-500 text-white rounded-md disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed ">
                    {text("community_status_by_region")}
                </button>
            </Link>
        </div>
    );
};

export default CommunityLinkButtons;