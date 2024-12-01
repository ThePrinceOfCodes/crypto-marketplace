import React, { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { htmlIds } from "@cypress/utils/ids";
import Link from "next/link";
import {
  Breadcrumbs,
  Avatar,
  Box,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import { AllTokensDataType, useGetAllTokens } from "api/hooks";
import { ParsedUrlQuery } from "querystring";
import { formatNumberWithCommas } from "@common/utils/formatters";
import AutoCompleteField from "@common/components/FormInputs/AutoComplete";
import useInitialTabRender from "@common/hooks/useInitialTabRender";
import {
  TDPlatformBalance,
  TDTransactionHistoryPanel,
  TDUsersBalance,
} from "./components";
import { DateFormatter } from "@common/components";
import useResponsive from "@common/hooks/useResponsive";
import { MuiLink } from "@common/components/MuiLink";

const TabOptions = [
  "token_details_tab_user_balance",
  "token_details_tab_platform_balance",
  "token_details_tab_transaction_history",
];

interface RouterQuery extends ParsedUrlQuery {
  onChain: string;
  totalTokens: string;
  swappable: string;
  address: string;
  logo: string;
  createdAt: string;
  tokenName: string;
  tabIndex?: string
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-label": `simple-tabpanel-${index}`,
  };
}

const TokenDetailsPage = () => {
  const router = useRouter();
  const { text } = useLocale();

  const [value, setValue] = useState(0);
  const { initialRender, setInitialRender } = useInitialTabRender(3);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const updatedQuery = {
      ...router.query,
      tabIndex: newValue.toString()
    };
    router.push({
      pathname: router.pathname,
      query: updatedQuery,
    });
  };

  const {
    onChain = "",
    totalTokens = "",
    swappable = "",
    address = "",
    logo = "",
    createdAt = "",
    tokenName = "",
    tabIndex
  }: RouterQuery = router.query as RouterQuery;

  useEffect(() => {
    if (tabIndex != undefined) {
      const tabValue = Number(tabIndex);
      setValue(tabValue);
      setInitialRender(tabValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  const { data: allTokens } = useGetAllTokens(
    {},
    {
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const { isMobile, isTablet } = useResponsive();

  const selectedValue = !allTokens?.allTokensData?.length
    ? { name: tokenName }
    : allTokens?.allTokensData?.find((token) => token.address === address);

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("copy_to_clipboard_message"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        id={`token-details-tab-${index}`}
        role="tabpanel"
        hidden={value !== index}        
        aria-label={`token-details-tab-${index}`}
        {...other}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </div>
    );
  }, []);

  return (
    <div className="flex flex-col justify-center items-center px-5 py-5">
      <div className="w-full mb-4">
        <Breadcrumbs aria-label="breadcrumb" className="w-full">
          <Link href="/tokens" passHref>
            <MuiLink
              underline="hover"
              color="inherit"
              className="text-xs"
            >
              {text("token_title")}
            </MuiLink>
          </Link>
          <MuiLink
            underline="hover"
            className="text-blue-500 text-xs"
            aria-current="page"
          >
            {text("token_details_title")}
          </MuiLink>
        </Breadcrumbs>
      </div>
      <div
        className={`flex w-full ${isMobile && !isTablet ? "flex-col" : "justify-between"
          }`}
      >
        <Tooltip title={tokenName} placement="bottom-start">
          <div className="text-2xl truncate ellipsis w-full">{tokenName}</div>
        </Tooltip>
        <AutoCompleteField
          className="w-80 bg-gray-50 rounded-xl my-1 sm:my-0"
          value={selectedValue}
          isOptionEqualToValue={(option: AllTokensDataType) => option.address === address}
          options={allTokens?.allTokensData || []}
          getOptionLabel={(option: AllTokensDataType) => option.name}
          disableClearable={true}
          label="token dropdown"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.5rem",
            },
            "& .MuiAutocomplete-input": {
              backgroundColor: "rgb(249 250 251)",
            },
          }}
          renderOption={(optionProps: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, option: AllTokensDataType) => {
            return (
              <div {...optionProps} className={`${optionProps.className} flex flex-1`} key={`${option.address}-${option.logo}`}>
                <Avatar
                  className="mr-4"
                  alt="Token logo"
                  src={option?.logo}
                  sx={{ width: 25, height: 25 }}
                />
                <span className="flex flex-1">{option.name}</span>
              </div>
            );
          }}
          onChange={(__: unknown, token: AllTokensDataType) => {
            router.push({
              pathname: "/token-details",
              query: {
                tokenName: token?.name,
                address: token?.address,
                onChain: token?.onChain,
                totalTokens: token?.total_tokens,
                swappable: token?.swappable,
                logo: token?.logo,
                createdAt: token?.createdAt,
              },
            });
          }}
        />
      </div>
      <div className="w-full platforms-">
        <span className="text-slate-500 text-sm">
          {text("token_details_supportive_text")}
        </span>
      </div>
      <div className="flex w-full gap-3 py-4 w-83vw h-140 overflow-x-auto">
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 rounded-lg h-24 w-56 border border-slate-300 px-4 py-3 flex-shrink-0">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_token_name")}
            </span>
            <div className="flex gap-2">
              <Avatar alt="" src={logo} />
              <Tooltip title={tokenName}>
                <span className="items-center font-medium text-sm truncate ellipsis">
                  {tokenName}
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_address")}
            </span>
            <div className="flex gap-3 mt-1">
              <span className="font-medium text-sm">
                {address.substring(0, 6) + "..." + address.slice(-6)}
              </span>
              <Image
                id={htmlIds.img_platform_details_copy_address}
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() =>
                  copyToClipboard(
                    (Array.isArray(address) ? address[0] : address) || "",
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_is_total_tokens")}
            </span>
            <div className="flex">
              <span className="flex items-center font-medium text-sm mt-1">
                {formatNumberWithCommas(parseInt(totalTokens))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_is_onChain")}
            </span>
            <div className="flex">
              <span className="flex items-center font-medium text-sm mt-1">
                {onChain}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_is_swappable")}
            </span>
            <div className="flex">
              <span className="flex items-center font-medium text-sm mt-1">
                {swappable}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("token_column_header_created_at")}
            </span>
            <span className="font-medium text-sm mt-1">
              <DateFormatter value={createdAt} />
            </span>
          </div>
        </div>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="platform detail tabs"
            variant="scrollable"
            sx={{
              "& .MuiTabs-scroller": {
                height: "auto !important",
              },
              mb: "5px"
            }}
          >
            {TabOptions.map((tab, index) => (
              <Tab
                key={index}
                className="rounded-md"
                label={text(tab as LocalKeys)}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <TDUsersBalance />
        </TabPanel>
        {initialRender[1] && (
          <TabPanel value={value} index={1}>
            <TDPlatformBalance />
          </TabPanel>
        )}
        {initialRender[2] && (
          <TabPanel value={value} index={2}>
            <TDTransactionHistoryPanel />
          </TabPanel>
        )}
      </Box>
    </div>
  );
};

export default TokenDetailsPage;
