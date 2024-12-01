import React, { useState } from "react";

import * as Yup from "yup";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { htmlIds } from "@cypress/utils/ids";
import { PlusIcon } from "@heroicons/react/24/outline";

import { useLocale } from "locale";
import CustomDialog from "@common/components/CustomDialog";
import FileUpload from "@common/components/FormInputs/FileUpload";
import { AddPlatformSuccessDialog } from "../AddPlatformSuccessDialog";
import {
  requiredStringValidator,
  requiredMultiselectValidator,
  requiredStringURLValidator,
} from "@common/utils/validationSchemas";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import AutoCompleteField from "@common/components/FormInputs/AutoComplete";
import { AllTokensDataType, IAddPlatformsErr, useAddPlatforms, useGetAllTokens } from "api/hooks";

type FormInterface = {
  name: string;
  url: string;
  platforms: string[];
};

const initialValues = {
  name: "",
  url: "",
  platforms: [],
};

const ButtonAddPlatform = ({ setLastId }: { setLastId: React.Dispatch<React.SetStateAction<string | undefined>> }) => {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [image, setImage] = useState<File | Blob | null>(null);
  const [createObjectURL, setCreateObjectURL] = useState<string | null>(null);
  const { mutateAsync: addPlatforms, isLoading: submitting } =
    useAddPlatforms();

  const { data: tokenDataList } = useGetAllTokens(
    {},
    {
      onError: (err) =>
        toast(err?.response?.data?.message ?? err?.response?.data?.message, {
          type: "error",
        }),
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const { allTokensData: tokens } = tokenDataList || { allTokensData: [] };

  const handleClose = () => {
    setOpen(false);
    setImage(null);
    setCreateObjectURL(null);
  };

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["name"],
      text("form_error_required"),
    );

    const multi_v = requiredMultiselectValidator(
      ["platforms"],
      text("form_error_select_item"),
    );

    const url_v = requiredStringURLValidator(
      ["url"],
      text("form_error_required"),
      text("form_error_invalid_url"),
    );

    return Yup.object().shape({ ...multi_v, ...string_v, ...url_v });
  };

  const onSubmit = (data: FormInterface) => {
    const { name, url, platforms } = data;    

    if (!image) {
      toast(text("platform_upload_image_toast"), { type: "error" });
      return;
    }

    const f = new FormData();
    f.append("file", image);
    f.append("name", name);
    f.append("url", url);
    f.append("platforms", JSON.stringify(platforms));

    addPlatforms(f)
      .then(() => {
        toast(text("platform_added"), { type: "success" });
        setOpen(false);
        setCreateObjectURL(null);
        setOpenSuccessDialog(true);
        setLastId(undefined);
      })
      .catch((err: IAddPlatformsErr) => {
        toast(err?.response?.data?.message, { type: "error" });
      });
  };

  return (
    <div>
      <button
        id={htmlIds.btn_platform_add_new_platform}
        className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span className="text-nowrap">{text("add_new_platform")}</span>
      </button>
      <CustomDialog
        open={open}
        onClose={() => handleClose()}
        titleText={text("add_new_platform")}
      >
        <FileUpload
          setFile={setImage}
          setFileUrl={setCreateObjectURL}
          previewFile={createObjectURL}
        />
        <span className="text-xs italic">
          {text("platform_image_file_size")}
        </span>

        <Box id={htmlIds.modal_platforms_add_platform_modal} sx={{ mt: 3 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema()}
            onSubmit={(values) => onSubmit(values)}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              function formFields(field: keyof FormInterface) {
                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];
                return { error, helperText, ...getFieldProps(field) };
              }

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}
                  >
                    <TextFieldInput
                      label={text("add_platform_name_title")}
                      placeholder={text("add_platform_name_placeholder")}
                      {...formFields("name")}
                    />

                    <TextFieldInput
                      label={text("add_platform_url_title")}
                      placeholder={text("add_platform_url_placeholder")}
                      {...formFields("url")}
                    />

                    <AutoCompleteField
                      multiple
                      options={tokens.map((token: AllTokensDataType) => token.name)}
                      label={text("add_platform_select_token")}
                      error={
                        touched["platforms"] && Boolean(errors["platforms"])
                      }
                      helperText={touched["platforms"] && errors["platforms"]}
                      onChange={(event: Event, newValue: string[]) => {
                        setFieldValue("platforms", newValue);
                      }}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        handleClose={handleClose}
                        loading={submitting}
                        cancelText={text("add_platform_cancel_btn_text")}
                        submitText={text("add_platform_submit_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </CustomDialog>

      <AddPlatformSuccessDialog
        open={openSuccessDialog}
        handleClose={() => setOpenSuccessDialog(false)}
      />
    </div>
  );
};

export default ButtonAddPlatform;
