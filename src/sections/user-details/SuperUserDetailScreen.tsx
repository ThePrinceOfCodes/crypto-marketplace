import useTabRenderUserPlatform from "@common/hooks/useTabRenderUser&Platform";
import { isSuperSaveUser } from "@common/utils/helpers";
import { htmlIds } from "@cypress/utils/ids";
import Link from "next/link";
import { Box, Breadcrumbs, Tab, Tabs } from "@mui/material";
import { useGetSuperUserDetail } from "api/hooks";
import { useLocale } from "locale";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import {
  BasicInformationTab,
  SuperSaveBankWalletDetailsTab,
  SuperSaveHistoryTab,
  TokensTab,
  TransactionHistoryTab,
  UserHistoryTab,
  UserRpaHistoryTab,
} from "./components";
import clsx from "clsx";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { MuiLink } from "@common/components/MuiLink";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type Query = {
  tabIndex: string,
  email?: string,
  name?: string,
  phone_number?: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clearFilters = (query: any) => {
  const { email, tabIndex } = query
  return { email, tabIndex}
}

function SuperUserDetailScreen() {
  const router = useRouter();
  const { tabIndex, email, name, phone_number } = router.query as Query;
  const { text } = useLocale();
  const [value, setValue] = useState(0);
  const [subTab, setSubTab] = useState(0);

  const handleOnGetUserFailed = (err: AxiosError) => {
    if (err.response?.status === 404 && (name && phone_number)) {
      router.push(`/users?searchKey=${name}`);
    }
  };

 
  const {
    data: user_details,
    refetch: refetchUserDetails,
    isLoading,
  } = useGetSuperUserDetail({ email, name, phone_number },{ onError: handleOnGetUserFailed});



  useEffect(() => {
    if(tabIndex != undefined) {
      const num = Number(tabIndex);
      setValue(num);
      setRenderAlways(num);
    }
  }, [tabIndex]);

  const { renderAlways, setRenderAlways } = useTabRenderUserPlatform(7);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setRenderAlways(newValue);
    setValue(newValue);
    setSubTab(0);
    router.query.tabIndex = newValue.toString();
    router.query = clearFilters(router.query)
    router.push(router);
  };

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        <Box>{children}</Box>
      </div>
    );
  }, []);

  return (
    <div className="h-full px-5 py-5">
      <Breadcrumbs aria-label="breadcrumb" className="w-full">
        <Link href="/users" passHref>
          <MuiLink
            underline="hover"
            color="inherit"
            className="text-xs"
          >
            {text("users_detail_link_users")}
          </MuiLink>
        </Link>
        <MuiLink
          underline="hover"
          className="text-blue-500 text-xs"
          aria-current="page"
        >
          {text("users_detail_link_user_detail")}
        </MuiLink>
      </Breadcrumbs>
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 id={htmlIds.h4_user_details_title} className="text-2xl font-medium">
          {user_details?.msq_name}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("users_detail_title_detail")}
        </span>
      </div>
      <Tabs
        className="flex mb-3"
        value={value}
        variant="scrollable"
        onChange={handleChange}
        sx={{
          "& .MuiTabs-scroller": {
            height: "auto !important",
          },
        }}
      >
        <Tab
          id={htmlIds.btn_user_details_select_basic_information_tab}
          label={text("users_detail_tab_basic_information")}
          className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
        />
        <Tab
          id={htmlIds.btn_user_details_select_token_tab}
          label={text("users_detail_tab_tokens")}
          className="flex-1 border border-neutral-200  border-solid"
        />
        <Tab
          id={htmlIds.btn_user_details_select_transaction_history_tab}
          label={text("users_detail_tab_transaction_history")}
          className="flex-1 border border-neutral-200  border-solid"
        />
        <Tab
          id={htmlIds.btn_user_details_select_transaction_history_tab}
          label={text("users_detail_tab_rpa_history")}
          className="flex-1 border border-neutral-200  border-solid"
        />
        {isSuperSaveUser(user_details) && (
          <Tab
            id={htmlIds.btn_user_details_select_super_save_history_tab}
            label={text("users_detail_tab_super_save_history")}
            className={"flex-1 border border-neutral-200  border-solid "}
          />
        )}

        <Tab
          id={htmlIds.btn_user_details_select_user_history_tab}
          label={text("users_detail_tab_user_history")}
          className={clsx("flex-1 border border-neutral-200  border-solid", {
            ["rounded-r-lg"]: !isSuperSaveUser(user_details),
          })}
        />

        {isSuperSaveUser(user_details) && (
          <Tab
            id={htmlIds.btn_user_details_select_super_save_history_tab}
            label={text("users_detail_tab_user_bank_and_wallet_details")}
            className={
              "rounded-r-lg flex-1 border border-neutral-200  border-solid "
            }
          />
        )}
      </Tabs>
      <TabPanel value={value} index={0}>
        <BasicInformationTab
          refetchUserDetails={refetchUserDetails}
          userDetail={user_details}
          isWithdrawalFormDetailLoading={isLoading}
          handleTabChange={(tabValue, subTabValue = 0) => {
            setRenderAlways(tabValue);
            setValue(tabValue);
            setSubTab(subTabValue);
          }}
        />
      </TabPanel>
      {renderAlways[1] && (
        <TabPanel value={value} index={1}>
          <TokensTab />
        </TabPanel>
      )}
      {renderAlways[2] && (
        <TabPanel value={value} index={2}>
          <TransactionHistoryTab />
        </TabPanel>
      )}
      {renderAlways[3] && (
        <TabPanel value={value} index={3}>
          <UserRpaHistoryTab />
        </TabPanel>
      )}
      {renderAlways[4] && isSuperSaveUser(user_details) && (
        <TabPanel value={value} index={4}>
          <SuperSaveHistoryTab />
        </TabPanel>
      )}
      {renderAlways[isSuperSaveUser(user_details) ? 5 : 4] && (
        <TabPanel value={value} index={isSuperSaveUser(user_details) ? 5 : 4}>
          <UserHistoryTab />
        </TabPanel>
      )}
      {renderAlways[6] && isSuperSaveUser(user_details) && (
        <TabPanel value={value} index={6}>
          <SuperSaveBankWalletDetailsTab
            userDetails={user_details}
            initialTab={subTab}
          />
        </TabPanel>
      )}
    </div>
  );
}

export default SuperUserDetailScreen;
