import CustomDialog from "@common/components/CustomDialog";
import React, { useEffect, useState } from "react";
import { Box, ListItemText, MenuItem, CircularProgress } from "@mui/material";
import { useLocale, LocalKeys } from "locale";
import {
  useGetCommunityListByAdmin,
  useGetSettings,
  useGetSuperSaveCommunityReward,
  useSaveDBInitialTokens,
} from "api/hooks";
import SelectField from "@common/components/FormInputs/SelectField";
import { htmlIds } from "@cypress/utils/ids";
import FormFooter from "@common/components/FormFooter";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { formatNumberWithCommas } from "@common/utils/formatters";

interface CommunityRewardDialogeProps {
  open: boolean;
  handleClose: () => void;
}

interface CommunityRewardDataCalculation {
  community: string;
  community_reward: number;
  overall_community_reward: number;
  result: string;
  total_reward: number;
}

const CommunityRewardDialoge: React.FC<CommunityRewardDialogeProps> = ({
  open,
  handleClose,
}) => {
  const { text } = useLocale();

  const validationSchema = () =>
    Yup.object({
      ["communityId"]: Yup.string().required(
        text("community_reward_validation_select_community"),
      ),
    });

  const { mutateAsync: saveDBInitialTokens } = useSaveDBInitialTokens();

  const { data, mutateAsync: getCommunityLists } = useGetCommunityListByAdmin();
  const [isLoading, setIsloading] = useState(false);

  const { data: settings, refetch } = useGetSettings();
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [communityRewardDataCalculation, setCommunityRewardDataCalculation] =
    useState<CommunityRewardDataCalculation>();

  const {
    mutateAsync: fetchCommunityReward,
    isLoading: getCommunityRewardLoading,
  } = useGetSuperSaveCommunityReward();

  const handleFetchCommunityData = async () => {
    if (selectedCommunity) {
      try {
        const res = await fetchCommunityReward(selectedCommunity);
        setCommunityRewardDataCalculation(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCommunityRewardSettingsUpdate = async ({
    communityId,
  }: {
    communityId: string;
  }) => {
    try {
      setIsloading(true);
      await saveDBInitialTokens({
        key: "REWARD_COMMUNITY",
        value: communityId,
      });
      toast(text("community_reward_settings_update_successfully"), {
        type: "success",
      });
    } catch (error) {
      console.log(error);
      toast(text("community_reward_settings_update_error"), { type: "error" });
    } finally {
      handleClose();
      refetch();
      setIsloading(false);
    }
  };

  useEffect(() => {
    getCommunityLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) {
      const rewardSettings = settings.find((s) => s.key === "REWARD_COMMUNITY");
      if (rewardSettings && rewardSettings.value) {
        try {
          setSelectedCommunity(rewardSettings.value);
        } catch (error) {
          console.error("Error parsing REWARD_COMMUNITY:", error);
        }
      }
    }
  }, [settings, open, handleClose]);

  // fetch
  useEffect(() => {
    handleFetchCommunityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommunity, setSelectedCommunity]);

  return (
    <CustomDialog
      titleText={text("community_reward_settings")}
      onClose={handleClose}
      open={open}
    >
      <p className="mb-4">{text("community_reward_settings_select")}</p>

      <Formik
        initialValues={{ communityId: "" }}
        validationSchema={validationSchema()}
        onSubmit={async (values) => {
          const { communityId } = values;
          await handleCommunityRewardSettingsUpdate({ communityId });
        }}
        // enableReinitialize
      >
        {({ errors, touched, setFieldValue }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (selectedCommunity) {
              setFieldValue("communityId", selectedCommunity);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [selectedCommunity, setFieldValue]);
          return (
            <Form>
              <SelectField
                variant="outlined"
                label={text("community")}
                value={selectedCommunity}
                id={htmlIds.select_time_setting_time_zone}
                error={touched.communityId && Boolean(errors.communityId)}
                helperText={touched.communityId && errors.communityId}
                onChange={(event) => {
                  setFieldValue("communityId", event.target.value);
                  setSelectedCommunity(event.target.value as string);
                }}
              >
                <MenuItem value="no_reward" className="text-xs">
                  <ListItemText
                    className="text-xs capitalize"
                    primary={text("community_reward_settings_no_reward")}
                  />
                </MenuItem>
                {data?.communityListData?.map((option, index) => (
                  <MenuItem key={index} value={option.name} className="text-xs">
                    <ListItemText
                      className="text-xs capitalize"
                      primary={text(option.name as LocalKeys)}
                    />{" "}
                  </MenuItem>
                ))}
              </SelectField>

              {/* Loading spinner */}
              {getCommunityRewardLoading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                    marginBottom: 2,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {/* Render data when available */}
              {!getCommunityRewardLoading &&
                communityRewardDataCalculation &&
                selectedCommunity !== "no_reward" && (
                  <Box sx={{ marginTop: 2 }}>
                    <p className="text-sm">
                      {text("community_reward_this_community_amount")}
                      <span className="font-bold">
                        {formatNumberWithCommas(communityRewardDataCalculation.community_reward)} 
                        {" " + text("korean_currency_name")}
                      </span>
                    </p>
                    <p className="text-sm">
                      {text("community_reward_all_community_amount")}
                      <span className="font-bold">
                        {formatNumberWithCommas(communityRewardDataCalculation.overall_community_reward)} 
                        {" " + text("korean_currency_name")}
                      </span>
                    </p>
                    <p className="text-sm">
                      {text("community_reward_total_credit_sale_amount")}
                      <span className="font-bold">
                        {formatNumberWithCommas(communityRewardDataCalculation.total_reward)} 
                        {" " + text("korean_currency_name")}
                      </span>
                    </p>
                    <p className="text-sm italic mt-1">
                      (<span className="font-bold">{text("community_reward_note")}</span>
                      {text("community_reward_note_description")})
                    </p>
                  </Box>
                )}

              <Box sx={{ display: "flex", columnGap: 2, marginTop: 3 }}>
                <FormFooter
                  handleClose={handleClose}
                  loading={isLoading}
                  cancelText={text("add_reserved_vault_cancel_title")}
                  submitText={text("add_reserved_vault_save")}
                  submitBtnId={htmlIds.btn_confirmation_dialog_yes}
                  cancelBtnId={htmlIds.btn_confirmation_dialog_no}
                />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
};

export default CommunityRewardDialoge;
