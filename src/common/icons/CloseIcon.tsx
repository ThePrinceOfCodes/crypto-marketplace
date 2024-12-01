import { IconPropsType } from "@common/types/icon";
import React from 'react';

const CloseIcon = ({width ="12",height="12",fill = ["none","black"]} : IconPropsType) => {
  return (
    <svg width={width} height={height} viewBox="0 0 12 12" fill={fill[0]} xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1L1 11M1 1L11 11" stroke={fill[1]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  );
};

export default CloseIcon;
