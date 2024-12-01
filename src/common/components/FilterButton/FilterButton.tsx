import { FilterIcon } from "@common/icons";
import React from 'react';
import { useLocale } from "locale";
import styles from "./style.module.css";

const FilterButton = ({ onClick }: { onClick: () => void }) => {
  const { text } = useLocale()
  return (
    <div className={styles['filter-button']} onClick={onClick}>
      <FilterIcon/>
      <span className={styles['filter-text']}>
      {text("date_filter_button_text")}
      </span>
    </div>
  );
};

export default FilterButton;
