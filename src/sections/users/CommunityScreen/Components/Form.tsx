import React from "react";
import { Formik, Form, FormikProps, getIn } from "formik";
import {
  Box,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import { useAddCommunity, useUpdateCommunity } from "api/hooks/community";
import { toast } from "react-toastify";
import { omit } from "lodash";
import {
  IPostCommunityForm,
  IGetCommunityFormResponse,
  SetFieldValue,
  SetFieldError,
  GetPropsType,
} from "api/hooks/community/types";
import {
  GoogleMap,
  Libraries,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import FormFooter from "@common/components/FormFooter";
import { InfoOutlined } from "@mui/icons-material";
import CheckboxField from "@common/components/FormInputs/CheckboxField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";
import {
  requiredEmailValidator,
  requiredCommunityPhoneValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";
import { PlacesAutocomplete } from "@sections/platform/platform-details/components/PDRegisterAffiliate/components/PlacesAutocomplete";
import { EditData } from "../CommunityScreen";
import { scrollToTop } from "@common/utils/helpers";


const countries = [
  { name: "Korea", value: "대한민국" },
  { name: "China", value: "중국" },
  { name: "Japan", value: "일본" },
  { name: "Vietnam", value: "베트남" },
];

type Props = {
  onCloseForm: () => void;
  refetch: () => void;
  setLastId: React.Dispatch<React.SetStateAction<string | undefined>>;
  editData: EditData | null;
  lastId: string | undefined;
};

const mapContainerStyle = {
  height: "250px",
  width: "100%",
  marginTop: "0px",
  borderRadius: "5px",
};

const address = {
  lat: 35.9078,
  lng: 127.7669,
};

const defaultInitialValues: IPostCommunityForm = {
  name: "",
  country: "대한민국", // Korea is the default country.
  representative: "",
  email: "",
  phone_number: "",
  referral_code: "" as unknown as number,
  guide_info: "",
  location: null
};

const AddCommunityForm: React.FC<Props> = ({
  onCloseForm,
  refetch,
  setLastId,
  editData,
  lastId
}) => {
  const { text } = useLocale();
  const libraryRef = React.useRef<Libraries>(["drawing", "places"]);
  const [showExtraFields, setShowExtraFields] = React.useState(
    !!editData?.location,
  );
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    libraries: libraryRef.current,
    language: "ko",
  });
  const [location, setLocation] = React.useState("");

  const formSuccessNError = () => {
    const onSuccess = (response: IGetCommunityFormResponse) => {
      setLastId(undefined);
      scrollToTop();
      onCloseForm();
      toast.success(response.data.message);
      lastId === undefined && refetch();
    };

    return { onSuccess };
  };

  const { mutateAsync: addCommunity, isLoading: isAdding } = useAddCommunity(
    formSuccessNError(),
  );

  const { mutateAsync: updateCommunity, isLoading: isUpdating } =
    useUpdateCommunity(formSuccessNError());

const validationSchema = Yup.object().shape({
  ...requiredStringValidator(
    [
      "name",
      "country",
      "representative",
      "email",
      "phone_number",
      "referral_code",
    ],
    text("form_error_required"),
  ),
  ...requiredEmailValidator(
    ["email"],
    text("form_invalid_email"),
    text("form_email_required"),
  ),
  phone_number: requiredCommunityPhoneValidator(text("form_error_community_phone_required")),
  guide_info: Yup.string().trim().when([], {
      is: () => showExtraFields,
      then: schema => schema.required(text("form_error_required")),
      otherwise: schema => schema.notRequired(),
    }),
   location: Yup.object().when([], {
    is: () => showExtraFields,
    then: schema => schema.required(text("form_map_required")),
    otherwise: schema => schema.notRequired(),
  }),
});

  const getInitialValues = (): IPostCommunityForm =>
    editData
      ? (omit(editData, "uuid") as unknown as IPostCommunityForm)
      : defaultInitialValues;

  const handleSubmit = async (values: IPostCommunityForm) => {
    if (editData) {
      try {
        await updateCommunity({ ...values, uuid: editData.uuid });
      } catch (error: any) {
        toast.error(
          error.response?.data.message || error.response?.data.result
        );
      }
    } else {
      try {
        await addCommunity(values);
      } catch (error: any) {
        toast.error(
          error.response?.data.message || error.response?.data.result
        );
      }
    }
  };

  const concatinate = (str1: string, str2: string) => {
    return `${str1}${str2}` as LocalKeys;
  };

  const getProps: GetPropsType = (field, touched, errors, getFieldProps) => {
  const error = touched[field as keyof IPostCommunityForm] && Boolean(errors[field as keyof IPostCommunityForm]);
  let helperText = touched[field as keyof IPostCommunityForm] && errors[field as keyof IPostCommunityForm];

  if (typeof helperText === "object" && helperText !== null) {
    helperText = JSON.stringify(helperText);
  }
  return { error: error || false, helperText: helperText || "", ...getFieldProps(field) };
  };

  const renderCountries = (values: IPostCommunityForm, setFieldValue: SetFieldValue, setFieldError: SetFieldError) =>
    countries.map(({ name, value }) => (
      <CheckboxField
        key={name}
        label={text(concatinate("community_country_", name.toLowerCase()))}
        checked={values.country === value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (event.target.checked) {
            setFieldValue("country", value);
          } else {
            setFieldValue("country", "");
            setFieldError("country", text("community_form_country_error"));
          }
        }}
      />
    ));

  return (
    <Formik
      initialValues={getInitialValues()}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      validateOnBlur={false}
      validate={(values) => {
        const errors = {};
        if (!showExtraFields) {
          values.guide_info = undefined;
          values.location = undefined;
        }
        return errors;
      }}
    >
      {({
        values,
        setFieldValue,
        touched,
        errors,
        getFieldProps,
        setFieldError,
      }: FormikProps<IPostCommunityForm>) => {
        const checkboxError = Boolean(errors["country"]);
        return (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
              {Object.keys(getInitialValues())
                .filter((name) => name !== "guide_info" && name !== "location")
                .map((name) =>
                  name === "country" ? (
                    <FormControl key={name} error={checkboxError}>
                      <FormLabel component="legend">
                        {text("community_form_country")}
                      </FormLabel>
                      <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                        {renderCountries(values, setFieldValue, setFieldError)}
                      </FormGroup>
                      {checkboxError && (
                        <FormHelperText sx={{ marginLeft: 0.5 }}>
                          {text("community_form_country_error")}
                        </FormHelperText>
                      )}
                    </FormControl>
                  ) : (
                    <TextFieldInput
                      key={name}
                      label={text(
                        concatinate("community_form_", name.toLowerCase()),
                      )}
                      type={name === "referral_code" ? "number" : "text"}
                      {...getProps(name, touched, errors, getFieldProps)}
                    />
                  ),
                )}
              <CheckboxField
                checked={showExtraFields}
                label={text("community_form_show_on_map_label")}
                onChange={(event) => setShowExtraFields(event.target.checked)}
              />
              {showExtraFields && (
                <>
                  <TextFieldInput
                    placeholder={text("community_form_guide_info")}
                    label={text("community_form_guide_info")}
                    multiline
                    rows={4}
                    {...getProps("guide_info", touched, errors, getFieldProps)}
                  />
                  {isLoaded && !loadError && (
                    <>
                      <PlacesAutocomplete
                        location={location}
                        label={text("community_form_location_search_label")}
                        required={false}
                        defaultValue={false}
                        setLocation={setLocation}
                        onPlaceChange={(place) => {
                          setLocation(place?.formatted_address);
                          const newLat = place?.geometry?.location?.lat();
                          const newLng = place?.geometry?.location?.lng();
                          setFieldValue("location.lat", newLat);
                          setFieldValue("location.lng", newLng);
                        }}
                      />
                      <GoogleMap
                        zoom={15}
                        center={{
                          lat: values?.location?.lat ?? address?.lat,
                          lng: values?.location?.lng ?? address?.lng,
                        }}
                        mapContainerStyle={mapContainerStyle}
                        id="map"
                        onClick={(event) => {
                          const newLat = event.latLng?.lat();
                          const newLng = event.latLng?.lng();
                          setFieldValue("location.lat", newLat);
                          setFieldValue("location.lng", newLng);
                        }}
                      >
                      {(values?.location?.lat && values?.location?.lng) ? (
                          <MarkerF
                            position={{ lat: values?.location?.lat, lng: values?.location?.lng }}
                            key="marker_1"
                            draggable
                            onDragEnd={(e) => {
                              const newLat = e?.latLng?.lat();
                              const newLng = e?.latLng?.lng();
                              setFieldValue("location.lat", newLat);
                              setFieldValue("location.lng", newLng);
                            }}
                          />
                        ) : (
                          <MarkerF
                            position={{ lat: address?.lat, lng: address?.lng }}
                            key="marker_1"
                            draggable
                            onDragEnd={(e) => {
                              const newLat = e?.latLng?.lat();
                              const newLng = e?.latLng?.lng();
                              setFieldValue("location.lat", newLat);
                              setFieldValue("location.lng", newLng);
                            }}
                          />
                        )}
                      </GoogleMap>
                       {touched?.location && errors?.location && (
                        <div className="text-xs text-red-600">{getIn(errors, "location")}</div>
                      )}
                      <div className="flex text-sm items-center text-slate-500 mt-2">
                        <InfoOutlined fontSize="small" />
                        {text("affiliate_map_click_tip")}
                      </div>
                    </>
                  )}
                </>
              )}
              <Box sx={{ display: "flex", flexDirection: "row", columnGap: 2 }}>
                <FormFooter
                  loading={isAdding || isUpdating}
                  cancelText={text("community_form_cancel")}
                  submitText={text("community_form_submit")}
                  handleClose={onCloseForm}
                />
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddCommunityForm;
