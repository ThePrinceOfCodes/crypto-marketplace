import React from "react";
import { Switch } from "@mui/material";
import { toast } from "react-toastify";
import {
  useGetSuperSaveWidgetsSettings,
  useUpdateSuperSaveWidgetSetting,
  UpdateSuperSaveWidgetSettingType,
} from "api/hooks";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";

const WidgetsSettingsPage = () => {
  const { text } = useLocale();

  const { data, refetch } = useGetSuperSaveWidgetsSettings();
  const { mutateAsync: updateSetting } = useUpdateSuperSaveWidgetSetting();

  const onUpdate = (props: UpdateSuperSaveWidgetSettingType) => {
    updateSetting(props, {
      onSuccess: () => {
        toast.success(
          text("menu_bar_sub_title_super_save_widget_settings_success_toast"),
          { autoClose: 1500 },
        );
        refetch();
      },
    });
  };

  return (
    <div className="h-full px-5 py-5">
      <div className="w-full mb-5 pb-5 tokens-header">
        <h4 className="text-2xl font-medium">
          {text("super_save_widgets_settings_page_title")}
        </h4>
        <span className="text-slate-500 text-sm">
          {text("super_save_widgets_settings_page_subtitle")}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <p>{text("super_save_widgets_setting_1_name")}</p>
            <p className="text-neutral-600 text-xs">
              {text("super_save_widgets_setting_1_des")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-neutral-700">
              {text(
                data?.widget1 === 1
                  ? "super_save_widgets_setting_visible"
                  : "super_save_widgets_setting_hidden",
              )}
            </p>
            <label htmlFor={htmlIds.checkbox_widget_setting_hide_reserves} className="flex items-center">
              <Switch
                id={htmlIds.checkbox_widget_setting_hide_reserves}
                onClick={() =>
                  onUpdate({
                    widget_number: 1,
                    status: data?.widget1 === 1 ? 0 : 1,
                  })
                }
                checked={data?.widget1 === 1}
                aria-label="Reserves switch"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p>{text("super_save_widgets_setting_2_name")}</p>
            <p className="text-neutral-600 text-xs">
              {text("super_save_widgets_setting_2_des")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-neutral-700">
              {text(
                data?.widget2 === 1
                  ? "super_save_widgets_setting_visible"
                  : "super_save_widgets_setting_hidden",
              )}
            </p>
            <label htmlFor={htmlIds.checkbox_widget_setting_hide_total_participation_amount} className="flex items-center">
              <Switch
                id={
                  htmlIds.checkbox_widget_setting_hide_total_participation_amount
                }
                onClick={() =>
                  onUpdate({
                    widget_number: 2,
                    status: data?.widget2 === 1 ? 0 : 1,
                  })
                }
                checked={data?.widget2 === 1}
                aria-label="Total Participation Amount switch"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p>{text("super_save_widgets_setting_3_name")}</p>
            <p className="text-neutral-600 text-xs">
              {text("super_save_widgets_setting_3_des")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-neutral-700">
              {text(
                data?.widget3 === 1
                  ? "super_save_widgets_setting_visible"
                  : "super_save_widgets_setting_hidden",
              )}
            </p>
            <label htmlFor={htmlIds.checkbox_widget_setting_hide_possibility_to_participate} className="flex items-center">
              <Switch
                id={
                  htmlIds.checkbox_widget_setting_hide_possibility_to_participate
                }
                onClick={() =>
                  onUpdate({
                    widget_number: 3,
                    status: data?.widget3 === 1 ? 0 : 1,
                  })
                }
                checked={data?.widget3 === 1}
                aria-label="Possibility to Participate switch"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p>{text("super_save_widgets_setting_4_name")}</p>
            <p className="text-neutral-600 text-xs">
              {text("super_save_widgets_setting_4_des")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-neutral-700">
              {text(
                data?.widget4 === 1
                  ? "super_save_widgets_setting_visible"
                  : "super_save_widgets_setting_hidden",
              )}
            </p>
            <label htmlFor={htmlIds.checkbox_widget_setting_hide_reserve_consumption_rate} className="flex items-center">
              <Switch
                id={htmlIds.checkbox_widget_setting_hide_reserve_consumption_rate}
                onClick={() =>
                  onUpdate({
                    widget_number: 4,
                    status: data?.widget4 === 1 ? 0 : 1,
                  })
                }
                checked={data?.widget4 === 1}
                aria-label="Reserve Consumption Rate switch"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WidgetsSettingsPage;
