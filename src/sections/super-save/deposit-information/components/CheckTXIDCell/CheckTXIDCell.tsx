import { useLocale } from "locale";
import React from "react";
import { ICheckTXIDCellProps } from "./types";

import { CircularProgress, Tooltip } from "@mui/material";
import { ICheckBulkTxidOnBlockChainResult } from "api/hooks";

const CheckTXIDCell = ({
  checkTxidResult,
  blockchainResult,
  isLoading,
}: ICheckTXIDCellProps) => {

  const { text } = useLocale();
  const parsedBlockchainResult: null | ICheckBulkTxidOnBlockChainResult = blockchainResult ? JSON.parse(blockchainResult) : null;
  const result = parsedBlockchainResult || checkTxidResult;
  return (
    <div className="flex items-center justify-center">
      {isLoading ? (
        <CircularProgress size={20} />
      ) : result ? (
        <>
          {result.status ? (
            <div className="text-blue-500 font-medium">
              {text(
                "deposit_information_column_coin_transfer_check_result_yes",
              )}
            </div>
          ) : (
            <Tooltip title={result.message} arrow placement="top">
              <div className="text-red-500 font-medium">
                {text(
                  "deposit_information_column_coin_transfer_check_result_no",
                )}
              </div>
            </Tooltip>
          )}
        </>
      ) : (
        "---"
      )}
    </div>
  );
};

export default CheckTXIDCell;
