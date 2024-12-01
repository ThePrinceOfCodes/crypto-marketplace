import React, { useState } from "react";
import { ICustomCellWithExpandableProps } from "./types";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

const CustomCellWithExpandable = ({
  text = "",
  textLimit = 120,
  onChangeExpendable,
}: ICustomCellWithExpandableProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
    onChangeExpendable && onChangeExpendable(!expanded);
  };

  return (
    <>
      {expanded ? (
        <div className="whitespace-normal items-center flex w-full justify-between leading-6">
          <p className="">{text}</p>

          {text?.length > textLimit && (
            <button
              aria-label="minus icon"
              onClick={handleExpandClick}
              className=" w-6 h-fit p-1 rounded border flex justify-center items-center "
            >
              <MinusIcon className="w-5 stroke-2 " />
            </button>
          )}
        </div>
      ) : (
        <div className="flex w-full justify-between items-center">
          <div className="flex-1 mr-2">
            {text?.length > textLimit
              ? text?.slice(0, textLimit) + "..."
              : text}
          </div>
          {text?.length > textLimit && (
            <button
              aria-label="plus icon"
              onClick={handleExpandClick}
              className=" w-6 h-fit p-1 rounded border flex justify-center items-center "
            >
              <PlusIcon className="w-full stroke-2 " />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default CustomCellWithExpandable;
