import { formatNumberWithCommas } from "@common/utils/formatters";
import { Avatar, Box, Button, IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import { Spinner } from "@common/components";
import { useGetUserTokens, useGetPrices } from "api/hooks";
import { DefaultLogoIcon, MSQIcon, MSQXIcon, P2UIcon } from "@common/icons";
import { useRefreshUserBalance } from "api/hooks";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { TokenQuantityMutationModal } from "../TokenQuantityMutationModal";
import { toast } from "react-toastify";


function TokensTab() {
  const { text } = useLocale();
  const email = useRouter().query.email as string;
  const { data: tokens, isLoading, error, refetch } = useGetUserTokens({ email });
  const { data: prices } = useGetPrices();
  const {
    mutateAsync: refreshUserBalance,
    isLoading: isLoadingRefetchUserBalance,
  } = useRefreshUserBalance();

  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"add" | "remove">("add");
  const [tokenName, setTokenName] = React.useState<string>();

  const handleOpenChangeQuantityModal =
    (type: "add" | "remove", tokenName: string) => () => {
      setType(type);
      setOpen(true);
      setTokenName(tokenName);
    };

  const handleModalClose = () => {
    setOpen(false);
  };

  const getLogo = (token: string) => {
    switch (token) {
      case "MSQ":
        return <MSQIcon />;
      case "MSQX":
        return <MSQXIcon />;
      // case "P2U":
      //   return <P2UIcon />;
      case "POL":
        return <Avatar src="/images/iconpng-matic.png" alt="Matic image" aria-label="Matic" />;
      default:
        return <DefaultLogoIcon />;
    }
  };

  const handleRefreshUserBalance = () => {
    refreshUserBalance(
      { user_email: email },
      {
        onSuccess: (data) => {
          const msg = `RPA Called Successfully ${
            data?.data?.message_ids?.length
              ? `\n Message ID ${data?.data.message_ids.pop()}`
              : ""
          }`;
          toast.success(msg);
          refetch().then((r) => {});
        },
        onError: (error) => {
          toast.error(error?.response?.data?.msg);
        },
      },
    ).catch(() => {});
  };

  if(isLoading){
    return(
     <div className="flex justify-center  items-center h-48">
      <Spinner size={10} />
     </div>
    );
  }

  if(error){
    return(
     <div className="flex flex-col justify-center border rounded-md items-center h-[40rem] ">
      <p className="text-black">{error?.response?.data?.result}</p>
     </div>
    );
  }

  return (
    <>
      <div className="flex justify-between w-full">
        <div className="font-medium text-lg">{text("users_token_title")}</div>
        <Button
          variant="text"
          id={htmlIds.btn_user_details_refresh_user_balance}
          onClick={handleRefreshUserBalance}
          disabled={isLoadingRefetchUserBalance || isLoading}
        >
          <Box display="flex" alignItems="center" className="text-gray-500">
            {isLoadingRefetchUserBalance ? (
              <Spinner size={5} />
            ) : (
              <Image
                className="mr-2"
                width={20}
                height={20}
                src="/images/refresh-icon.svg"
                alt="Refresh Button"
              />
            )}
            {text("users_token_refresh")}
          </Box>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        {tokens?.map((token) => (
          <div
            className="flex flex-col w-full min-h-36 rounded-lg border border-slate-300 py-4 px-6"
            key={token.id}
          >
            <Box>{getLogo(token.name)}</Box>
            <Tooltip title={token?.name}
               slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -60],
                        },
                      },
                    ],
                  },
               }}
            >
            <Box className="pt-4 text-gray-400 font-medium text-sm popinText truncate">
              {token?.name}
            </Box>
            </Tooltip>
            <Box className="flex items-center text-xl font-medium mt-2 popinText flex-wrap">
              <p>
                {prices &&
                  formatNumberWithCommas(
                    Math.floor(
                      (prices[token.name as keyof typeof prices]?.price || 1) *
                        token.balance,
                    ),
                  ) + "P"}
              </p>
              <Box
                ml={2}
                display={
                  ["P2U", "P2UP", "P2UPB"].includes(token.name) ? "flex" : "none"
                }
              >
                <IconButton
                  aria-label="add icon"
                  disabled={isLoadingRefetchUserBalance}
                  onClick={handleOpenChangeQuantityModal("add", token.name)}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  aria-label="remove icon"
                  disabled={isLoadingRefetchUserBalance}
                  onClick={handleOpenChangeQuantityModal("remove", token.name)}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            </Box>
          </div>
        ))}
      </div>
      <TokenQuantityMutationModal
        open={open}
        type={type}
        tokenName={tokenName}
        onClose={handleModalClose}
      />
    </>
  );


}

export default TokensTab;