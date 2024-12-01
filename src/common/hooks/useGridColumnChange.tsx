import { useState, useCallback } from "react";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import { getLocalStorageState, showSortingPageNotification } from "@common/utils/helpers";
import { useLocale } from "locale";

const useGridColumnChange = (localStorageKey: string) => {

  if (!localStorageKey) {
    throw new Error("An argument for 'localStorageKey' was not provided.");
  }

  if (typeof localStorageKey !== "string") {
    throw new Error(
      `localStorageKey must be a string but got ${typeof localStorageKey}`,
    );
  }

  const apiRef = useGridApiRef();

  const { text } = useLocale();

  const [columnCurrentState, setColumnCurrentState] = useState<any>({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleColumnChange = (isSort = false) => {
    const state = apiRef.current.exportState();
    const isColumnStateChanged =
      JSON.stringify(state) ===
      JSON.stringify(getLocalStorageState(localStorageKey));
    if (isColumnStateChanged) {
      setColumnCurrentState({});
    } else {
      if (isSort) {
        showSortingPageNotification(text("toast_warning_sorting_page"));
      }
      setColumnCurrentState(state);
    }
  };

  const handleSaveView = () => {
    localStorage.setItem(localStorageKey, JSON.stringify(columnCurrentState));
    setColumnCurrentState({});
    setOpenConfirmDialog(false);
  };

  const handleResetDefault = (reload = true) => {
    localStorage.removeItem(localStorageKey);
    setColumnCurrentState({});
    reload && window.location.reload();
  };



  const restoreOrder = () => {
    const state = getLocalStorageState(localStorageKey);
    if (state) {
      apiRef?.current?.restoreState({ ...state });
    }
  };

  const resetSorting = useCallback(() => {
    const currentSortModel = apiRef.current?.getSortModel() || [];
    if (currentSortModel.length > 0) {
      apiRef.current?.setSortModel([]);
      setColumnCurrentState({});
    }
  }, [apiRef]);

  return {
    apiRef,
    restoreOrder,
    handleSaveView,
    openConfirmDialog,
    columnCurrentState,
    handleColumnChange,
    handleResetDefault,
    resetSorting,
    setOpenConfirmDialog,
    setColumnCurrentState,
  };
};

export { useGridColumnChange };
