import { useAuth, useDialog } from "@common/context";
import useTabRenderUserPlatform from "@common/hooks/useTabRenderUser&Platform";
import React, {
  useState,
  useCallback,
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
} from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { htmlIds } from "@cypress/utils/ids";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  Tabs,
  Tab,
  Box,
  Breadcrumbs,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  PDAffiliatesPanel,
  PDMultipleAdminsPanel,
  PDSupportedTokenPanel,
  PDTransactionHistoryPanel,
  PDDashboardPanel,
} from "./components";
import { LocalKeys, useLocale } from "locale";
import {
  IPlatforms,
  useDeleteApiKey,
  useGetAllPlatforms,
  useGetPlatformAPIKey,
  usePostApiKey,
} from "api/hooks";
import { ParsedUrlQuery } from "querystring";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { DateFormatter, Spinner } from "@common/components";
import AutoCompleteField from "@common/components/FormInputs/AutoComplete";
import { MuiLink } from "@common/components/MuiLink";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-label" :`simple-tabpanel-${index}`,
  };
}

const TabOptions = [
  "platform_details_tab_transaction_history",
  "platform_details_tab_supported_tokens",
  "platform_details_tab_admins",
  "platform_details_tab_affiliates",
  "platform_details_tab_dashboard",
];

interface RouterQuery extends ParsedUrlQuery {
  offChainAddress: string;
  onChainAddress: string;
  platform_user: string;
  url: string;
  logo: string;
  createdAt: string;
  platformName: string;
  platform: string;
  tabIndex?: string;
}
const PlatformDetailsPage = () => {
  const router = useRouter();
  const { text } = useLocale();

  const [value, setValue] = useState(0);
  const { renderAlways, setRenderAlways } = useTabRenderUserPlatform(5);

  const {
    offChainAddress = "",
    onChainAddress = "",
    platform_user = "",
    url = "",
    logo = "",
    createdAt = "",
    platformName = "",
    platform: platformId = "",
    tabIndex
  }: RouterQuery = router.query as RouterQuery;

  useEffect(() => {
    if (tabIndex != undefined) {
      const tabValue = Number(tabIndex);
      setValue(tabValue);
      setRenderAlways(tabValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);


  const urlLength = url.length > 28;
  const truncateUrl = (url: string) => {
    return url.length > 28 ? url.slice(0, 26) + "...." : url;
  };
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

  const { data: allPlatforms } = useGetAllPlatforms(
    { limit: 25 },
    {
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const selectedValue = !allPlatforms?.platforms?.length
    ? { name: platformName }
    : allPlatforms?.platforms?.find((platform) => platform.uuid === platformId);
  const { user } = useAuth();

  const {
    data: api_key,
    isFetching: isApiKeyFetching,
    refetch: refetchApiKey,
  } = useGetPlatformAPIKey(
    { platform_id: platformId as string },
    {
      enabled: !!platformId && user?.email === platform_user,
    },
  );
  const { confirmDialog } = useDialog();
  const { mutateAsync: createApiKey, isLoading: isCreateApiKeyLoading } =
    usePostApiKey();
  const { mutateAsync: deleteApiKey, isLoading: isDeleteApiKeyLoading } =
    useDeleteApiKey();

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast(text("copy_to_clipboard_message"), {
      type: "success",
      autoClose: 1500,
    });
  };

  const handleCreateApiKey = () => {
    confirmDialog({
      title: text("platform_details_create_api_key_confirmation_title"),
      content: text("platform_details_create_api_key_confirmation_content"),
      onOk: async () => {
        createApiKey({
          platform_id: platformId,
        })
          .then((res) => {
            refetchApiKey();
            toast(res.message, {
              type: "success",
            });
          })
          .catch((err) => {
            toast(err.response.data.status || err.response.data.message, {
              type: "error",
            });
          });
      },
    });
  };

  const handleDeleteApiKey = () => {
    confirmDialog({
      title: text("platform_details_delete_api_key_confirmation_title"),
      content: text("platform_details_delete_api_key_confirmation_content"),
      onOk: async () => {
        deleteApiKey({
          platform_id: [platformId],
        })
          .then((res) => {
            refetchApiKey();
            toast(res.message, {
              type: "success",
            });
          })
          .catch((err) => {
            toast(
              err.response.data.reasult ||
               err.response.data.msg ||
               err.response.data.message,
              {
                type: "error",
              },
            );
          });
      },
    });
  };

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        id={`simple-tab-${index}`}
        role="tabpanel"
        hidden={value !== index}
        aria-label={`simple-tabpanel-${index}`}
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
          <Link href='/platforms' passHref>
            <MuiLink
              underline="hover"
              color="inherit"
              className="text-xs"
            >
              {text("platform_details_platforms_title")}
            </MuiLink>
          </Link>
          <MuiLink
            underline="hover"
            className="text-blue-500 text-xs"
            aria-current="page"
          >
            {text("platform_details_token_details_heading")}
          </MuiLink>
        </Breadcrumbs>
      </div>
      <div className="flex flex-col sm:flex-row w-full justify-between items-center">
        <div className="sm:mb-0 mb-3">
          <div id={htmlIds.div_platform_details_title} className="text-2xl">
            {platformName}
          </div>
          <span className="text-slate-500 text-sm">
            {text("platform_details_supportive_text")}
          </span>
        </div>
        <AutoCompleteField
          className="w-60 bg-gray-50 "
          value={selectedValue}
          options={allPlatforms?.platforms || []}
          getOptionLabel={(option: IPlatforms) => option.name}
          disableClearable={true}
          label={text("platform_dropdown_label")}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.5rem",
            },
            "& .MuiAutocomplete-input": {
              backgroundColor: "rgb(249 250 251)",
            },
          }}
          renderOption={(
            optionProps: DetailedHTMLProps<
              HTMLAttributes<HTMLDivElement>,
              HTMLDivElement
            >,
            option: IPlatforms,
          ) => {
            return (
              <div
                {...optionProps}
                className={`${optionProps.className} flex flex-1`}
                key={`${option.onChainAddress}-${option.uuid}`}
              >
                <Avatar
                  className="mr-4"
                  alt="Platform logo"
                  src={option?.logo}
                  sx={{ width: 25, height: 25 }}
                />
                <span className="flex flex-1">{option.name}</span>
              </div>
            );
          }}
          onChange={(__: unknown, platform: IPlatforms) => {
            router.push({
              pathname: "/platform-details",
              query: {
                platform: platform?.uuid,
                platformName: platform?.name,
                onChainAddress: platform?.onChainAddress,
                offChainAddress: platform?.offChainAddress,
                platform_user: platform?.platform_user,
                url: platform?.url,
                logo: platform?.logo,
                createdAt: platform?.createdAt,
              },
            });
          }}
        />
      </div>
      <div className="flex w-full gap-3 py-4 w-83vw h-140 overflow-x-auto">
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 rounded-lg h-24 w-56 border border-slate-300 px-4 py-3 flex-shrink-0">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("platform_details_name_title")}
            </span>
            <div className="flex gap-2">
              <Avatar alt="" src={logo} />
              <span className="flex items-center font-medium text-sm">
                {platformName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border  border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm  popinText">
              {text("platform_details_url_title")}
            </span>
            <Tooltip
              title={url}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#f3f3f3",
                    color: "#545454",
                    display: urlLength ? "block" : "none",
                  },
                },
              }}
            >
              <span className="flex items-center font-medium truncate text-sm mt-1">
                {truncateUrl(url)}
              </span>
            </Tooltip>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("platform_details_platform_users_title")}
            </span>
            <div className="flex">
              <span className="flex items-center font-medium text-sm mt-1">
                {platform_user}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("platform_details_off_chain_address")}
            </span>
            <div className="flex gap-3 mt-1">
              <span className="font-medium text-sm">
                {offChainAddress.substring(0, 6) +
                  "..." +
                  offChainAddress.slice(-6)}
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
                    (Array.isArray(offChainAddress)
                      ? offChainAddress[0]
                      : offChainAddress) || "",
                  )
                }
              />
            </div>
          </div>
        </div>
        {!!onChainAddress.length && (
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
              <span className="text-gray-400 font-medium text-sm popinText">
                {text("platform_details_on_chain_address")}
              </span>
              <div className="flex gap-3 mt-1">
                <span className="font-medium text-sm">
                  {onChainAddress.substring(0, 6) +
                    "..." +
                    onChainAddress.slice(-6)}
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
                      (Array.isArray(onChainAddress)
                        ? onChainAddress[0]
                        : onChainAddress) || "",
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("platform_details_uuid")}
            </span>
            <div className="flex gap-3 mt-1">
              <span className="font-medium text-sm">
                {platformId.substring(0, 6) + "..." + platformId.slice(-6)}
              </span>
              <Image
                className="cursor-pointer"
                alt=""
                width={17}
                height={17}
                src="/images/copy-icon.svg"
                onClick={() => copyToClipboard(platformId)}
              />
            </div>
          </div>
        </div>
        {platform_user === user?.email && (
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
              <span className="text-gray-400 font-medium text-sm popinText">
                {text("platform_details_api_key")}
              </span>
              {isApiKeyFetching ||
               isCreateApiKeyLoading ||
               isDeleteApiKeyLoading ? (
                <Spinner className={"mt-2"} />
              ) : !api_key ? (
                <button
                  id={htmlIds.btn_platform_details_add_api_key}
                  className="flex items-center text-sm h-10 text-blue-500 rounded-md"
                  onClick={handleCreateApiKey}
                >
                  <PlusIcon className="w-5 stroke-2" />
                  <span>{text("add_platform_details_api_key")}</span>
                </button>
              ) : (
                <div className="flex gap-3 mt-1 items-center">
                  <span className="font-medium text-sm">
                    {api_key.substring(0, 6) + "..." + api_key.slice(-6)}
                  </span>
                  <Image
                    className="cursor-pointer"
                    alt=""
                    width={17}
                    height={17}
                    src="/images/copy-icon.svg"
                    onClick={() => copyToClipboard(api_key || "")}
                  />
                  <XCircleIcon
                    id={htmlIds.btn_platform_details_remove_api_key}
                    onClick={handleDeleteApiKey}
                    className={"h-6 w-6 text-red-600 cursor-pointer"}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex-shrink-0">
          <div className="flex flex-col gap-3 h-24 w-56 rounded-lg border border-slate-300 px-4 py-3">
            <span className="text-gray-400 font-medium text-sm popinText">
              {text("platform_details_created_at")}
            </span>
            <span className="font-medium text-sm mt-1">
              <DateFormatter value={createdAt} />
            </span>
          </div>
        </div>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }} className="mt-3">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="platform detail tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {TabOptions.map((tab, index) => (
              <Tab
                key={index}
                label={text(tab as LocalKeys)}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <PDTransactionHistoryPanel />
        </TabPanel>
        {renderAlways[1] && (
          <TabPanel value={value} index={1}>
            <PDSupportedTokenPanel />
          </TabPanel>
        )}
        {renderAlways[2] && (
          <TabPanel value={value} index={2}>
            <PDMultipleAdminsPanel />
          </TabPanel>
        )}
        {renderAlways[3] && (
          <TabPanel value={value} index={3}>
            <PDAffiliatesPanel platformName={platformName} />
          </TabPanel>
        )}
        {renderAlways[4] && (
          <TabPanel value={value} index={4}>
            <PDDashboardPanel platform_id={platformId} />
          </TabPanel>
        )}
      </Box>
    </div>
  );
};

export default PlatformDetailsPage;
