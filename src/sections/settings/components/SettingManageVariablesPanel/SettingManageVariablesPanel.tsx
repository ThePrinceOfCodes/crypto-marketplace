import { Spinner } from "@common/components";
import { INPUT_CLASS } from "@common/constants/classes";
import InfoIcon from "@common/icons/InfoIcon";
import { getEnvVariableDetails } from "@common/utils/envVariables";
import SaveIcon from "@mui/icons-material/Save";
import { Button, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import {
  ISaveDBInitialTokensErr,
  useGetSettings,
  useSaveDBInitialTokens,
} from "api/hooks";
import { useLocale } from "locale";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import TextFieldInput from "@common/components/FormInputs/TextField";

function SettingManageVariablesPanel() {
  const { text } = useLocale();
  const isXLScreen = useMediaQuery("(min-width: 1280px)");

  const { data, refetch } = useGetSettings();
  const [seletedPos, setSelectedPos] = useState(0);

  const [envValue, setEnvValue] = useState<{ key: string; value: string }[]>(
    [],
  );
  const { mutateAsync: saveDBInitialTokens, isLoading: submitting } =
    useSaveDBInitialTokens();

  const onSubmit = (pos: number) => {
    saveDBInitialTokens({
      key: envValue[pos].key,
      value: envValue[pos].value,
    })
      .then(() => {
        refetch();
        toast(text("setting_variable_toast_settings_updated_successfully"), {
          type: "success",
        });
      })
      .catch((err: ISaveDBInitialTokensErr) => {
        toast(err?.response?.data?.message || err?.response?.data?.error, { type: "error" });
      });
  };

  useEffect(() => {
    if (data) setEnvValue([...data]);
  }, [data]);

  return (
    <div className="h-full">
      <div className="w-full mb-5 pb-5 platforms-header">
        <div className="xl:w-[620px] flex justify-between flex-wrap">
          <div>
            <h4 className="text-2xl font-medium">
              {" "}
              {text("setting_variable_title")}
            </h4>
            <span className="text-slate-500 text-sm">
              {text("setting_variable_subtitle")}
            </span>
          </div>
          <Link href="/super-save/admin-history">
            <Button
              variant="contained"
              className="w-28 mt-2 h-10 bg-blue-500 text-white rounded-md"
            >{text("setting_variable_history")}</Button>
          </Link>
        </div>
      </div>
      {data?.length ? (
        data.map((obj, idx: number) => {
          return (
            <div className="input-section" key={obj.key}>
              <div className="flex flex-col xl:flex-row w-full xl:w-auto mb-14 xl:mb-0 h-11 justify-center items-center">
                <div className="h-11 w-full xl:w-[360px] flex justify-center items-center text-slate-500 text-sm xl:border xl:border-gray-300 rounded-l-lg bg-white">
                  <p>{obj.key}</p>
                  <div>
                    <Tooltip title={getEnvVariableDetails(obj.key)}>
                      <IconButton aria-label="info">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full xl:w-[200px] flex justify-left items-center text-sm font-medium text-gray-900 md:border-gray-300 bg-white">
                  <label className="w-full" aria-label={obj.key}>
                    <TextFieldInput
                      value={envValue[idx]?.value}
                      onChange={(e) => {
                        const newEnvValue = [...envValue];
                        newEnvValue[idx].value = e.target.value;
                        setEnvValue([...newEnvValue]);
                      }}
                      sx={isXLScreen ? {
                        "& .MuiInputBase-root": {
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderTopRightRadius: 8,
                          borderBottomRightRadius: 8
                        }
                      } : {}}
                    />
                  </label>
                </div>

                <Button
                  disabled={submitting}
                  onClick={() => {
                    setSelectedPos(idx);
                    onSubmit(idx);
                  }}
                  className={"xl:ml-5 h-7 submit-env-variable"}
                >
                  {submitting && seletedPos === idx ? (
                    <Spinner />
                  ) : (
                    <IconButton aria-label="save Icon">
                      <SaveIcon className={"text-color-blue-500"} />
                    </IconButton>
                  )}
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex w-full pt-10 justify-center">
          <Spinner size={8} />
        </div>
      )}
    </div>
  );
}

export default SettingManageVariablesPanel;