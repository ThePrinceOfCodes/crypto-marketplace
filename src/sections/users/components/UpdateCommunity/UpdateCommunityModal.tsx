import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { useAuth } from "@common/context";
import { htmlIds } from "@cypress/utils/ids";
import { Box, ListItemText, MenuItem } from "@mui/material";
import { useGetCommunityListByAdmin, useUpdateUserCommunityByAdmin } from "api/hooks";
import { Form, Formik } from "formik";
import { LocalKeys, useLocale } from "locale";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface UpdateFormProp {
  community: string;
  memo: string;
}

interface UpdateCommunityModalProps {
  open: boolean;
  userId: string | undefined;
  onClose: () => void;
  refetch: () => void;
  community?: string
}
const UpdateCommunityModal = ({ open, userId, onClose, refetch, community }: UpdateCommunityModalProps) => {
  const { text } = useLocale();
  const { user } = useAuth();

  const { data, mutateAsync: getCommunityLists } = useGetCommunityListByAdmin();
  const { isLoading: updateLoading, mutateAsync: UpdateUserCommunity } = useUpdateUserCommunityByAdmin();

  useEffect(() => {
    if (!user) return;
    getCommunityLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSave = async (values: UpdateFormProp) => {
    try {
      await UpdateUserCommunity(
        { ...values, user_id: userId },
        {
          onSuccess: () => {
            toast.success(text("super_save_user_community_update"), {
              autoClose: 1500,
            });
            refetch();
          },
        }
      );
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.error(text("super_save_user_community_offline_error"), {
          autoClose: 1500,
        });
      } else {
        toast.error(error.response?.data?.result || "There was an error try again");
      }
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const initialValues = {
    community: "",
    memo: "",
  };

  const validationSchema = Yup.object().shape({
    community: Yup.string().required(),
    memo: Yup.string().trim().required(),
  });

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText="Update Team"
      maxWidth="xs"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSave(values);
        }}
      >
        {({ errors, touched, getFieldProps, setFieldValue }) => {
          return (
            <Form autoFocus>
              <Box
                sx={{ display: "flex", flexDirection: "column", rowGap: 3, marginTop: 4, gap: 2 }}
              >
                <SelectField
                  variant="outlined"
                  label="Community"
                  id={htmlIds.select_time_setting_time_zone}
                  error={touched.community && Boolean(errors.community)}
                  helperText={touched.community && errors.community}
                  defaultValue={community}
                  onChange={(e) => setFieldValue("community", e.target.value)}
                >
                  {data?.
                    communityListData?.map((option, index) => (
                      <MenuItem key={index} value={option.name} className="text-xs" >
                        <ListItemText
                          className="text-xs capitalize"
                          primary={text(option.name as LocalKeys)}
                        />
                      </MenuItem>
                    ))}
                </SelectField>
                <TextFieldInput
                  placeholder={text("placeholder_memo")}
                  label={text("placeholder_memo")}
                  multiline
                  rows={4}
                  error={touched.memo && Boolean(errors.memo)}
                  helperText={touched.memo && errors.memo}
                  {...getFieldProps("memo")}
                />
                <Box display="flex" flex={1} gap={2} mb={1}>
                  <FormFooter
                    handleClose={handleClose}
                    loading={updateLoading}
                    submitText={text("time_setting_modal_save")}
                    cancelText={text("time_setting_modal_cancel")}
                  />
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
};

export default UpdateCommunityModal;
