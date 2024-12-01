import React from "react";
import { useLocale } from "locale";
import useResponsive from "@common/hooks/useResponsive";

const SearchBox = ({ onChangeFunc, isIcon = true, placeholderText = "platform_requests_search_placeholder", value }: { onChangeFunc: (text: string) => void, isIcon?: boolean, placeholderText?: string, value?: string }) => {
  const { text } = useLocale();
  const { isBigScreen }  = useResponsive();

  return (
    <div className={`relative ${isBigScreen ? "w-60" : "w-full"}`}>
      {isIcon &&
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      }
      <input
        type="search"
        onChange={(e) => onChangeFunc(e.target.value)}
        value={value}
        className={`block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 ${isIcon ? "pl-10" : ""}`}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        placeholder={text(placeholderText)}
      />
    </div>
  );
};

export default SearchBox;
