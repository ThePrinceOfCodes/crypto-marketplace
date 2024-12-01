import { IconPropsType } from "@common/types/icon";
import React from "react";

const DefaultLogoIcon: React.FC<IconPropsType> = ({
  width = "32",
  height = "32",
  fill = ["#EDEEF2", "#4D81BA", "#3768A4", "#11338C"],
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={width} height={height} rx="16" fill={fill[0]} />
      <path
        d="M25 11.1065V20.9515L16.2494 25.874L9.68604 22.1834V19.7212L16.2494 23.4121L22.8126 19.7212V9.87623L25 11.1065Z"
        fill={fill[1]}
      />
      <path
        d="M22.8128 9.87653V12.3369L16.2494 8.64624V6.18432L22.8128 9.87653Z"
        fill={fill[2]}
      />
      <path
        d="M13.2919 15.4828H9.68609V13.2939H13.2919L13.9062 14.3884L13.2919 15.4828ZM15.6334 13.2939L14.4033 11.1068H7.49719V20.9518L9.68609 22.1836V17.6702H14.4033L15.6334 15.4828L16.2493 14.3884L15.6334 13.2939Z"
        fill={fill[3]}
      />
    </svg>
  );
};

export default DefaultLogoIcon;
