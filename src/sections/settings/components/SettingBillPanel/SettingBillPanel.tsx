import { useLocale } from "locale";

const SettingBillPanel = () => {
  const { text } = useLocale();
  return (
    <div className="w-full mb-5 pb-5 platforms-header">
      <h4 className="text-2xl font-medium"> {text("setting_billing_title")}</h4>
      <span className="text-slate-500 text-sm">
        {" "}
        {text("setting_billing_subtitle")}
      </span>
    </div>
  );
};

export default SettingBillPanel;
