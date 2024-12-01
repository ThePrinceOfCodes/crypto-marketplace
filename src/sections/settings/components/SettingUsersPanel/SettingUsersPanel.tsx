import { Fragment } from "react";
import { SettingTokenPrices } from "../SettingTokenPrices";
import { SettingExchangeRates } from "../SettingExchangeRates";
import { useLocale } from "locale";

const SettingUsersPanel = () => {
  const { text } = useLocale();
  return (
    <Fragment>
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium"> {text("setting_users_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("setting_users_subtitle")}
        </span>
      </div>
      <SettingTokenPrices />
      <SettingExchangeRates />
    </Fragment>
  );
};

export default SettingUsersPanel;
