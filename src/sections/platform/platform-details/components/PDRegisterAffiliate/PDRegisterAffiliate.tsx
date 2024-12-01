import { htmlIds } from "@cypress/utils/ids";
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  forwardRef,
  Ref,
  useImperativeHandle,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import {
  DialogContent,
  DialogContentText,
  Box,
  IconButton,
} from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";
import { LocalKeys, useLocale } from "locale";
import {
  PlatformAffiliateType,
  iPatchUpdateAffiliateStatusErr,
  useDeleteCategoryList,
  useGetAllPlatforms,
  usePatchUpdateAffiliateStatus,
  usePostAddAffiliate,
  usePostAddCategory,
  usePostUpdateAffiliateDetail,
  useDenyStore,
  useGetPlatformAffiliatesCategoryListAdmin,
} from "api/hooks";
import PDCategory from "./components/PDCategory/PDCategory";
import { Delete, InfoOutlined } from "@mui/icons-material";
import { queryClient } from "api";
import { affiliateCities } from "./affiliateCities";
import FileUpload from "@common/components/FormInputs/FileUpload";
import { Formik, Form } from "formik";

import AutoCompleteField from "@common/components/FormInputs/AutoComplete";
import TextFieldInput from "@common/components/FormInputs/TextField";

import * as Yup from "yup";

import {
  stringURLValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";
import FormFooter from "@common/components/FormFooter";
import CustomDialog from "@common/components/CustomDialog";
import { useDialog } from "@common/context";
import { PlacesAutocomplete } from "./components/PlacesAutocomplete";
import { values } from "lodash";
import { isValidJSON } from "@common/utils/helpers";
// import { PDAffiliateMerchantForm } from "./components/PDAffiliateMerchantForm";
interface RegisterAffiliateInitialData extends Partial<PlatformAffiliateType> {
  address_suggestion?: string;
}

interface RegisterAffiliatesProps {
  platformName: string;
  refetch?: () => void;
  selectedItem: PlatformAffiliateType | null;
  setSelectedItem: Dispatch<SetStateAction<PlatformAffiliateType | null>>;
  currentAffiliateTab: number;
  registerStoreInitialData?: RegisterAffiliateInitialData;
  onCloseRegisterStore?: () => void;
  showAllCategories?: boolean;
  externalRegisterMode?: boolean;
}

const center = {
  lat: 35.9078,
  lng: 127.7669,
};

const defaultInitialValues = {
  name: "",
  code: "",
  category: [],
  store_details: "",
  map_link: "",
  city: "",
};

const mapContainerStyle = {
  height: "250px",
  width: "100%",
  marginTop: "30px",
  borderRadius: "5px",
};

export interface RegisterAffiliateRef {
  openRegisterStore: () => void;
  openUpdateStore: () => void;
  openStatusChangeDialog: (isDenyMode?: boolean) => void;
  openDeleteStoreDialog: (isDeleteMode?: boolean) => void;
}

const PDRegisterAffiliate = (
  props: RegisterAffiliatesProps,
  ref: Ref<RegisterAffiliateRef>,
) => {
  const { text } = useLocale();

  const {
    platformName,
    refetch,
    selectedItem,
    setSelectedItem,
    currentAffiliateTab,
    externalRegisterMode,
    registerStoreInitialData,
    showAllCategories,
    onCloseRegisterStore,
  } = props;
  const binRegx = /^\w+_\w+_\w+$/;
  const router = useRouter();
  const { confirmDialog } = useDialog();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    libraries: ["drawing", "places"],
    language: "ko",
  });
  const { data: allAffiliateCategoriesRes } =
    useGetPlatformAffiliatesCategoryListAdmin(null, {
      enabled: !!showAllCategories,
    });

  const allAffiliateCategories = useMemo(
    () => allAffiliateCategoriesRes?.data || [],
    [allAffiliateCategoriesRes],
  );
  const { mutateAsync: addAffiliate, isLoading: createAffiliateLoading } =
    usePostAddAffiliate();
  const {
    mutateAsync: updateAffiliateDetail,
    isLoading: updateAffiliateLoading,
  } = usePostUpdateAffiliateDetail();
  const { mutateAsync: updateAffiliate } = usePatchUpdateAffiliateStatus();
  const { mutateAsync: postAddCategory } = usePostAddCategory();
  const { mutateAsync: deleteCategoryFromListApi } = useDeleteCategoryList();
  const { mutateAsync: denyStoreAPI } = useDenyStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [image, setImage] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [disabledField, setDisabledField] = useState(false);
  const [createObjectURL, setCreateObjectURL] = useState<any | null>(null);
  const [formFields, setFormFields] = useState<object>();
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isDenyMode, setIsDenyMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [address, setAddress] = useState(center);

  const [randomKey, setRandomKey] = useState(Math.random());
  const platformId: string | string[] = router.query.platform || "";

  const resetForm = (removeFromLocalStorage = false) => {
    setAddress({ lat: 35.9078, lng: 127.7669 });
    setCreateObjectURL(null);
    setImage(null);
    if (removeFromLocalStorage) {
      localStorage.removeItem("affiliateForm");
      localStorage.removeItem("affiliateImage");
    }
  };

  useImperativeHandle(ref, () => ({
    openRegisterStore: () => {
      setOpen(true);
    },
    openUpdateStore: () => {
      setIsEditMode(true);
      setOpen(true);
      if (!isFormLoaded) {
        setRandomKey(Math.random());
      }
    },
    openStatusChangeDialog: (isDenyMode = false) => {
      setOpenConfirmDialog(true);
      setIsDenyMode(isDenyMode);
    },
    openDeleteStoreDialog: (isDeleteMode = false) => {
      setOpenConfirmDialog(true);
      setIsDeleteMode(isDeleteMode);
    },
  }));

  const handleClose = (removeFromLocalStorage = false) => {
    setOpen(false);
    setIsEditMode(false);
    resetForm(removeFromLocalStorage);
    setIsFormLoaded(false);
    setLocation("");
    setAddress(center);
    setSelectedItem(null);
    if (onCloseRegisterStore) {
      onCloseRegisterStore();
    }
  };

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["name", "code", "store_details", "city"],
      text("form_error_required"),
    );

    // const multi_v = requiredMultiselectValidator(
    //   ["category"],
    //   text("form_error_select_item"),
    // );

    const url_v = stringURLValidator(
      ["map_link"],
      text("form_error_invalid_url"),
    );

    return Yup.object().shape({ ...string_v, ...url_v });
  };

  const { data: allPlatforms } = useGetAllPlatforms(
    { limit: 25, searchKey: platformName }, // Using platformName here
    {
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const base64ToBlob = (base64String: string) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" }); // Adjust type if necessary
  };

  useEffect(() => {
    const data = localStorage.getItem("affiliateForm");
    const affiliateImageData = localStorage.getItem("affiliateImage");
    if (open && data && !isEditMode && !externalRegisterMode) {
      const affiliateForm = JSON.parse(data);
      if (affiliateForm) {
        setAddress(affiliateForm.address);
        setLocation(affiliateForm.location);
      }
    }

    if (open && affiliateImageData && !isEditMode) {
      const blob = base64ToBlob(affiliateImageData);
      const imageUrl = URL.createObjectURL(blob);
      setImage(blob);
      setCreateObjectURL(imageUrl);
    }
    setIsFormLoaded(true);
  }, [isEditMode, open, randomKey, externalRegisterMode]);

  const loadInitialValues = () => {
    if (externalRegisterMode) {
      const v = {
        name: registerStoreInitialData?.name,
        code: registerStoreInitialData?.code,
        store_details: registerStoreInitialData?.store_details,
        map_link: "",
        city: "",
        category: [],
      };
      return v;
    }

    if (open && !isEditMode) {
      const data = localStorage.getItem("affiliateForm");
      if (data) {
        const affiliateForm = JSON.parse(data);
        const v = {
          name: affiliateForm.name,
          code: affiliateForm.code,
          category: affiliateForm.category,
          store_details: affiliateForm.store_details,
          map_link: affiliateForm.map_link,
          city: affiliateForm.city,
        };
        return v;
      }
    } else if (isEditMode && selectedItem) {
      setLocation(selectedItem.address);
      setAddress(selectedItem.location);
      setCreateObjectURL(selectedItem.image_url);
      const parsedCategory = isValidJSON(selectedItem.category)
        ? JSON.parse(selectedItem.category)
        : [];
      const v = {
        name: selectedItem.name,
        code: selectedItem.code,
        category: parsedCategory,
        store_details: selectedItem.store_details,
        map_link: selectedItem.map_link,
        city: selectedItem.city,
      };
      return v;
    }
    return defaultInitialValues;
  };

  const initialValues = React.useMemo(
    () => loadInitialValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, isEditMode, selectedItem, externalRegisterMode],
  );

  const isLoading = createAffiliateLoading || updateAffiliateLoading;

  useEffect(() => {
    if (open && isFormLoaded && !isEditMode && !externalRegisterMode) {
      localStorage.setItem(
        "affiliateForm",
        JSON.stringify({
          ...formFields,
          address,
        }),
      );
    }
  }, [
    formFields,
    address,
    isFormLoaded,
    isLoaded,
    open,
    isEditMode,
    externalRegisterMode,
  ]);

  useEffect(() => {
    if (open && isFormLoaded && !isEditMode && !externalRegisterMode) {
      if (image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem("affiliateImage", reader.result as string);
        };
        reader.readAsDataURL(image);
      } else {
        localStorage.removeItem("affiliateImage");
      }
    }
  }, [image, isFormLoaded, isLoaded, open, isEditMode, externalRegisterMode]);

  const isNewBusinessNumber = binRegx.test(selectedItem?.code as string);

  useEffect(() => {
    if (selectedItem && isNewBusinessNumber && currentAffiliateTab === 2) {
      setDisabledField(true);
    } else {
      setDisabledField(false);
    }
  }, [binRegx, currentAffiliateTab, isNewBusinessNumber, selectedItem]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    if (!isEditMode && !image) {
      toast(text("token_upload_image_toast"), { type: "error" });
      return;
    }
    //prepare form;
    if (platformId || externalRegisterMode) {
      const { category, city, code, map_link, name, store_details } = data;
      const form_data = new FormData();
      form_data.append("file", image);
      form_data.append("code", isEditMode ? selectedItem?.code : code);
      if (isEditMode) {
        form_data.append("new_code", code);
      }
      form_data.append("name", name);
      form_data.append("address", location);
      form_data.append("city", text(city as LocalKeys, { locale: "en_US" }));
      form_data.append("store_details", store_details);
      form_data.append("map_link", map_link);
      form_data.append("rate", "100");
      form_data.append("category", JSON.stringify(category));
      if (!isEditMode && !externalRegisterMode) {
        form_data.append("platform_id", router.query.platform as string);
      }
      form_data.append(
        "location",
        JSON.stringify({
          lat: address.lat,
          lng: address.lng,
        }).replace(/\.*/, ""),
      );

      if (isEditMode) {
        updateAffiliateDetail(form_data)
          .then(() => {
            toast(text("affiliate_details_updated_success"), {
              type: "success",
            });
            handleClose();
            if (refetch) setTimeout(() => {
              refetch();
            }, 500);
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: any) => {
            toast(err?.response?.data?.message, { type: "error" });
          });
      } else {
        addAffiliate(form_data)
          .then(() => {
            toast(text("affiliate_registered_success"), { type: "success" });
            handleClose(true);
            if (refetch) refetch();
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: any) => {
            toast(err?.response?.data?.message, { type: "error" });
          });
      }
    }
  };

  const handleOnDeleteCategory = (
    event: React.MouseEvent<HTMLElement>,
    categoryToDelete: string,
  ) => {
    event.stopPropagation();
    confirmDialog({
      title: text("affiliate_delete_category_confirm_title"),
      content: text("affiliate_delete_category_confirm_content"),
      onOk: async () => {
        await deleteCategoryFromListApi({
          platform_id: platformId as string,
          categories: [categoryToDelete],
        });
        queryClient.invalidateQueries("all-platforms");
        toast.success(text("affiliate_delete_category_success"));
      },
    });
  };

  const getErrorMessage = (error: any): string => {
    return (
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      "An unexpected error occurred. Please try again."
    );
  };

  const onUpdateAffiliateStatus = async () => {
    let params: { code: string; activated: boolean; approved?: boolean } = {
      code: selectedItem?.code || "",
      activated: !selectedItem?.activated,
      approved: true,
    };
    if (currentAffiliateTab === 2) {
      params = { ...params, activated: true };
    }
    updateAffiliate(params)
      .then(() => {
        toast(text("affiliate_status_updated_success"), { type: "success" });
        setOpenConfirmDialog(false);
        setSelectedItem(null);
        setTimeout(() => {
          refetch?.();
        }, 500);
      })
      .catch((err: iPatchUpdateAffiliateStatusErr) => {
        setOpenConfirmDialog(false);
        toast(getErrorMessage(err), { type: "error" });
      });
  };

  const onDenyStoreHandler = async () => {
    denyStoreAPI({ code: selectedItem?.code || "" })
      .then(() => {
        toast(text("affiliate_status_deny_success"), { type: "success" });
        setOpenConfirmDialog(false);
        setIsDenyMode(false);
        setIsDeleteMode(false);
        setSelectedItem(null);
        setTimeout(() => {
          refetch?.();
        }, 500);
      })
      .catch((err: iPatchUpdateAffiliateStatusErr) => {
        setOpenConfirmDialog(false);
        setIsDenyMode(false);
        setIsDeleteMode(false);
        toast(getErrorMessage(err), { type: "error" });
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnPlaceChanged = (place: any) => {
    if (place && place.formatted_address && place.geometry?.location) {
      setLocation(place.formatted_address);
      setAddress((prev) => ({
        ...prev,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }));
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat && lng) {
      setAddress((prev) => ({
        ...prev,
        lat,
        lng,
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLongLat = (event: any) => {
    setAddress((prev) => ({
      ...prev,
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    }));
  };

  const allAffiliateCities = affiliateCities.map((city) => ({
    label: text(city as LocalKeys),
    value: city,
  }));

  const handleGetOptions = () => {
    return showAllCategories
      ? allAffiliateCategories
      : allPlatforms?.platforms.filter(
          (platform) => platform.uuid === platformId,
        )[0]?.category_list;
  };

  const handleCloseConfirmDialog = useCallback(() => {
    setOpenConfirmDialog(false);
    setIsDeleteMode(false);
    setIsDenyMode(false);
  }, []);

  const storeText = text("affiliate_register_enable_disable_text");
  const affiliateRegisterAction = `${text(
      isDenyMode || isDeleteMode
        ? isDenyMode
          ? "affiliate_register_deny"
          : "affiliate_register_delete"
        : !selectedItem?.approved && !selectedItem?.activated
        ? "affiliate_register_approve"
        : selectedItem?.activated
        ? "affiliate_register_disable"
        : "affiliate_register_enable",
    )}`;

  return (
    <div>
      {!externalRegisterMode && (
        <div className="flex flex-wrap gap-2 place-content-end">
          <PDCategory
            onClose={() => null}
            onOk={(data) =>
              postAddCategory(
                {
                  platform_id: platformId as string,
                  category: data,
                },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries("all-platforms");
                    toast.success(text("affiliate_add_category_success"));
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onError: (err: any) => {
                    toast(err?.response?.data?.message, { type: "error" });
                  },
                },
              )
            }
          />
          <button
            id={htmlIds.btn_platform_details_affiliates_register_affiliates}
            className="flex items-center text-md px-4 h-11 bg-blue-500 text-white rounded-lg my-1"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="w-5 stroke-2 mr-2" />
            <span>{text("affiliate_register_title")}</span>
          </button>
        </div>
      )}

      <CustomDialog
        open={open}
        onClose={() => handleClose(false)}
        titleText={
          isEditMode
            ? text("affiliate_update_store")
            : text("affiliate_register_title")
        }
      >
        <FileUpload
          setFileUrl={setCreateObjectURL}
          setFile={setImage}
          previewFile={createObjectURL}
        />
        <span className="text-xs italic">{text("token_image_file_size")}</span>

        <Formik
          initialValues={initialValues}
          onSubmit={(values) => onSubmit(values)}
          validationSchema={validationSchema()}
        >
          {({ errors, touched, values, getFieldProps, setFieldValue }) => {
            //eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              setFormFields({ ...values, location });
            }, [values, location]);

            function fieldProps(field: string, errorsNText?: boolean) {
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const error = touched[field] && Boolean(errors[field]);
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const helperText = touched[field] && errors[field];

              return {
                error,
                helperText,
                ...(errorsNText ? {} : getFieldProps(field)),
              };
            }

            return (
              <Form>
                <Box
                  sx={{
                    rowGap: 3,
                    display: "flex",
                    flexDirection: "column",
                    mt: 4,
                  }}
                >
                  <TextFieldInput label="Store Name" {...fieldProps("name")} />

                  <TextFieldInput
                    label="Business Number"
                    {...fieldProps("code")}
                    value={
                      typeof fieldProps("code").value === "string"
                        ? fieldProps("code").value.split("_")[0]
                        : "--"
                    }
                    disabled={disabledField}
                  />
                  {currentAffiliateTab === 2 && isNewBusinessNumber && (
                    <TextFieldInput
                      label="New Business Number"
                      {...fieldProps("code")}
                      value={
                        typeof fieldProps("code").value === "string"
                          ? fieldProps("code").value.split("_")[1]
                          : "--"
                      }
                      disabled={disabledField}
                    />
                  )}
                  <AutoCompleteField
                    value={values.category}
                    multiple
                    name="category"
                    label="Category"
                    options={handleGetOptions() || []}
                    getOptionLabel={(option: string) => option}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    renderOption={(optionProps: any, option: string) => {
                      return (
                        <div
                          {...optionProps}
                          className={`${optionProps.className} flex w-full`}
                        >
                          <span className="flex-1 truncate text-ellipses">{option}</span>
                          {platformId ? (
                            <IconButton
                              onClick={(e) => handleOnDeleteCategory(e, option)}
                            >
                              <Delete className="text-slate-400" />
                            </IconButton>
                          ) : (
                            ""
                          )}
                        </div>
                      );
                    }}
                    {...fieldProps("category", true)}
                    onChange={(__: unknown, newValue: any) => {
                      setFieldValue("category", newValue);
                    }}
                  />

                  <TextFieldInput
                    label="Store Details"
                    {...fieldProps("store_details")}
                  />

                  <TextFieldInput label="URL" {...fieldProps("map_link")} />

                  <AutoCompleteField
                    label="City"
                    name="city"
                    options={allAffiliateCities}
                    value={
                      text(values.city as LocalKeys) as unknown as {
                        label: string;
                        value: string;
                      }
                    }
                    onChange={(event: Event, newValue: any) => {
                      setFieldValue("city", newValue?.value);
                    }}
                    {...fieldProps("city", true)}
                  />

                  {isLoaded && (
                    <Box>
                      <PlacesAutocomplete
                        location={location}
                        setLocation={setLocation}
                        onPlaceChange={handleOnPlaceChanged}
                      />
                      <p className="flex text-sm items-center text-slate-500 mt-2">
                        {registerStoreInitialData?.address_suggestion}
                      </p>
                      <GoogleMap
                        zoom={15}
                        center={address}
                        mapContainerStyle={mapContainerStyle}
                        onClick={handleMapClick}
                        id="map"
                      >
                        <MarkerF
                          position={address}
                          key="marker_1"
                          draggable
                          onDragEnd={updateLongLat}
                        />
                      </GoogleMap>
                      <div className="flex text-sm items-center text-slate-500 mt-2">
                        <InfoOutlined fontSize="small" />
                        {text("affiliate_map_click_tip")}
                      </div>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", mt: 1, columnGap: 2 }}>
                    <FormFooter
                      loading={isLoading}
                      submitText={text("affiliate_register_submit")}
                      handleClose={() => handleClose(false)}
                      cancelText={text("affiliate_register_cancel")}
                    />
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomDialog>

      <CustomDialog
        open={openConfirmDialog}
        onClose={() => handleCloseConfirmDialog()}
        titleText={`${affiliateRegisterAction} ${storeText}`}
      >
        <DialogContentText id="alert-dialog-slide-description">{`${text(
          "affiliate_register_modal_confirmation_warning_msg",
        )} ${affiliateRegisterAction.toLowerCase()} ${text(
          "affiliate_register_this_text",
        )} ${storeText.toLowerCase()}`}</DialogContentText>
        <Box sx={{ display: "flex", mt: 3, columnGap: 2 }}>
          <FormFooter
            handleClose={handleCloseConfirmDialog}
            loading={false}
            onSubmit={
              isDenyMode || isDeleteMode
                ? onDenyStoreHandler
                : onUpdateAffiliateStatus
            }
            cancelText={text("affiliate_register_cancel")}
            submitText={text("affiliate_register_yes")}
          />
        </Box>
      </CustomDialog>
    </div>
  );
};

export default forwardRef(PDRegisterAffiliate);
