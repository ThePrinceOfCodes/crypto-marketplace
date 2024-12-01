import * as Yup from "yup";
import { htmlIds } from "@cypress/utils/ids";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { Box, ListItemText, MenuItem } from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useLocale } from "locale";
import {
  iPostAddPlatformTokenErr,
  useGetAllTokens,
  usePostAddPlatformToken,
} from "api/hooks";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import { Formik, Form } from "formik";
import { requiredStringValidator } from "@common/utils/validationSchemas";

interface ButtonAddPlatformTokenProps {
  onAdded?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  platformTokens: any;
}

interface FormData {
  tokenName: string;
}

const PDAddPlatformTokenButton = (props: ButtonAddPlatformTokenProps) => {
  const { text } = useLocale();
  const { onAdded } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data } = useGetAllTokens(
    {},
    { onError: (err) => toast(err?.message, { type: "error" }) },
  );

  const { mutateAsync: postAddPlatformToken, isLoading } =
    usePostAddPlatformToken();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformId: any = router.query.platform || "";

  const onSubmit = async (data: FormData) => {
    if (platformId) {
      postAddPlatformToken({
        platformId,
        ...data,
      })
        .then(() => {
          toast.success(text("add_new_token_success"));
          setOpen(false);
          onAdded?.();
        })
        .catch((err: iPostAddPlatformTokenErr) => {
          toast.error(err?.response?.data?.msg);
        });
    }
  };

  return (
    <div>
      <button
        id={htmlIds.btn_platform_details_add_new_token}
        className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md text-nowrap"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span>{text("add_new_token_title")}</span>
      </button>
      <CustomDialog
        open={open}
        onClose={() => setOpen(false)}
        titleText={text("add_new_token_title_subtitle")}
      >
        <Formik
          onSubmit={(values) => onSubmit(values)}
          initialValues={{ tokenName: "" }}
          validationSchema={Yup.object().shape(
            requiredStringValidator(["tokenName"], text("form_error_required")),
          )}
        >
          {({ errors, touched, getFieldProps }) => (
            <Form>
              <SelectField
                variant="outlined"
                helperText={touched["tokenName"] && errors["tokenName"]}
                error={touched["tokenName"] && Boolean(errors["tokenName"])}
                label={text("add_new_token_select_token")}
                {...getFieldProps("tokenName")}
              >
                {data?.allTokensData.map((token) => {
                  const name = token.name;
                  const isPlatformToken = props.platformTokens?.some(
                    (el: any) => el.name === name,
                  );
                  return (
                    !isPlatformToken && (
                      <MenuItem
                        className="text-xs text-neutral-500 max-w-[375px]"
                        key={name}
                        value={name}
                      >
                        <ListItemText
                          classes={{
                            primary: "truncate",
                          }}
                          className="text-xs"
                          primary={name.charAt(0).toUpperCase() + name.slice(1)}
                        />
                      </MenuItem>
                    )
                  );
                })}
              </SelectField>

              <Box sx={{ display: "flex", columnGap: 2, mt: 3 }}>
                <FormFooter
                  handleClose={() => setOpen(false)}
                  loading={isLoading}
                  cancelText={text("add_new_token_cancel")}
                  submitText={text("add_new_token_submit")}
                />
              </Box>
            </Form>
          )}
        </Formik>
      </CustomDialog>
    </div>
  );
};

export default PDAddPlatformTokenButton;
