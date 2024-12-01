import { IconPropsType } from "@common/types/icon";
import React from 'react';

const MenuIcon = ({width = "20",height = "14",fill =["none"]} : IconPropsType) => {
  return (
    <svg width={width} height={height} viewBox="0 0 20 14" fill={fill[0]} xmlns="http://www.w3.org/2000/svg">
      <path d="M1 7H19M1 1H19M1 13H19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  );
};

export default MenuIcon;
