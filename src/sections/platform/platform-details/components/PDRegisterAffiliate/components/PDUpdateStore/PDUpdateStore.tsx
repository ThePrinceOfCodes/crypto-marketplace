// remove this file if everything is ok
/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Checkbox,
  Dialog,
  DialogTitle,
  FormControl,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextareaAutosize,
} from "@mui/material";
import { useLocale } from "locale";
import Image from "next/image";
import { htmlIds } from "@cypress/utils/ids";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Spinner } from "@common/components/Spinner";
import { useForm } from "react-hook-form";
import { InputText, InputTextWithIcon } from "@common/components";
import {
  PlatformAffiliateType,
  useDeleteCategoryList,
  useGetAllPlatforms,
  usePostUpdateAffiliateDetail,
} from "api/hooks";
import {
  GoogleMap,
  MarkerF,
  StandaloneSearchBox,
  useLoadScript,
} from "@react-google-maps/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { Delete, InfoOutlined } from "@mui/icons-material";
import { useDialog } from "@common/context";
import { queryClient } from "api";
// import { PDAffiliateMerchantForm } from "../PDAffiliateMerchantForm";

type PDUpdateStoreProps = {
  selectedItem?: PlatformAffiliateType | null;
  refetch?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
};

function PDUpdateStore(props: PDUpdateStoreProps) {
  const { selectedItem, refetch } = props;
  const { text } = useLocale();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef: any = useRef();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    libraries: ["drawing", "places"],
    language: "ko",
  });

  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState({
    lat: 35.9078,
    lng: 127.7669,
  });

  const { confirmDialog } = useDialog();

  const platformId: string | string[] = router.query.platform || "";
  const mapContainerStyle = {
    height: "250px",
    width: "100%",
    marginTop: "30px",
    borderRadius: "5px",
  };
  const MenuProps = {
    PaperProps: {
      style: {
        width: 240,
        borderRadius: 8,
      },
    },
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { mutateAsync: updateAffiliateDetail, isLoading } =
    usePostUpdateAffiliateDetail();
  const { mutateAsync: deleteCategoryFromListApi } = useDeleteCategoryList();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [image, setImage] = useState<any | null>(null);
  const [createObjectURL, setCreateObjectURL] = useState<any | null>(null);
  const hiddenFileInput = React.useRef<any | null>(null);
  const handleClick = () => {
    hiddenFileInput.current.click();
  };
  const [category, setCategory] = useState<string[]>([]);
  const { data: allPlatforms } = useGetAllPlatforms(
    { limit: 25 },
    {
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const handleSelectChange = (event: SelectChangeEvent<typeof category>) => {
    const {
      target: { value },
    } = event;
    setCategory(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handlePlaceChanged = () => {
    const [place] = inputRef.current?.getPlaces() || [];
    if (place) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadToClientImage = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
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
        setCategory((prev) =>
          prev.filter((category) => category !== categoryToDelete),
        );
        queryClient.invalidateQueries("all-platforms");
        toast.success(text("affiliate_delete_category_success"));
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = handleSubmit(async (data: any) => {
    if (platformId) {
      const form_data = new FormData();
      form_data.append("file", image);
      form_data.append("code", selectedItem?.code as string);
      form_data.append("name", data.name);
      form_data.append("address", data.location);
      form_data.append("store_details", data.store_details);
      form_data.append("map_link", data.map_link);
      form_data.append("rate", "100");
      form_data.append("categories", JSON.stringify(category));
      form_data.append(
        "location",
        JSON.stringify({
          lat: address.lat,
          lng: address.lng,
        }).replace(/\.*/, ""),
      );

      updateAffiliateDetail(form_data)
        .then(() => {
          toast(text("affiliate_details_updated_success"), { type: "success" });
          setOpen(false);
          setCreateObjectURL(null);
          if (refetch) refetch();
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) => {
          toast(err?.response?.data?.message, { type: "error" });
        });
    }
  });

  useEffect(() => {
    if (selectedItem) {
      reset({
        name: selectedItem?.name,
        rate: selectedItem?.rate,
        code: selectedItem?.code,
        store_details: selectedItem?.store_details,
        location: selectedItem?.address,
        image_url: selectedItem?.image_url,
        map_link: selectedItem?.map_link,
      });
      const allCategories = allPlatforms?.platforms.filter(
        (platform) => platform.uuid === platformId,
      )[0]?.category_list;
      const parsedCategory = JSON.parse(selectedItem?.category);
      const existingCategory = parsedCategory.filter((category: string) =>
        allCategories?.includes(category),
      );
      setCategory(existingCategory);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <>
      <button
        className={`flex items-center text-md px-6 h-11 ml-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:border disabled:border-gray-300 ${
          selectedItem?.activated === true
            ? "border border-green-600 text-green-600"
            : "border border-red-600 text-red-600"
        } rounded-lg`}
        onClick={() => setOpen(true)}
        disabled={!selectedItem}
      >
        <span>
          {selectedItem?.activated === false
            ? text("affiliate_update_disable")
            : text("affiliate_update_disable")}{" "}
          {text("affiliate_register_btn")}
        </span>
      </button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle className="font-semibold flex justify-center">
          <h2 className="mt-8 font-medium text-xl px-28">
            {text("affiliate_update_store")}
          </h2>
          <button
            className="flex items-start text-slate-400 h-8 w-8"
            onClick={handleClose}
          >
            <XMarkIcon className="h-8 w-8 p-1 border-solid border-2 rounded-full" />
          </button>
        </DialogTitle>
        <div className="flex items-center mt-3 w-full px-8">
          <Avatar
            alt=" "
            src={createObjectURL ? createObjectURL : selectedItem?.image_url}
            className="w-16 h-16"
            style={{
              display: createObjectURL
                ? createObjectURL
                : selectedItem?.image_url
                ? "flex"
                : "none",
            }}
          />
          <div className="flex flex-col ml-1">
            <div className="flex">
              <div>
                <input
                  id={htmlIds.input_add_token_modal_upload_image}
                  type="file"
                  name="image_url"
                  className="hidden"
                  onChange={uploadToClientImage}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(event: any) => (event.target.value = "")}
                  ref={hiddenFileInput}
                />
                <button
                  id={htmlIds.btn_add_token_modal_upload_image}
                  onClick={handleClick}
                  className="flex items-center text-sm px-4 h-8 bg-blue-500 text-white rounded-lg ml-4"
                >
                  {text("affiliate_update_image_title")}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full px-8 pb-8">
          <form
            onKeyDown={(e) => {
              e.key === "Enter" && e.preventDefault();
            }}
            onSubmit={onSubmit}
          >
            <div className="w-full flex items-center gap-4">
              <InputText
                id={htmlIds.input_platform_details_affiliates_name}
                error={errors?.name?.message}
                type="name"
                labelFor="name"
                labelText="affiliate_register_name"
                {...register("name", {
                  required: text("affiliate_register_name_error"),
                })}
                placeholder="affiliate_register_name_placeholder"
              />
              <InputText
                id={htmlIds.input_platform_details_affiliates_code}
                error={errors?.code?.message}
                disabled={true}
                type="code"
                labelFor="code"
                labelText="affiliate_register_business_number"
                {...register("code", {
                  required: text("affiliate_register_business_number_error"),
                })}
                placeholder="affiliate_register_business_number_placeholder"
              />
            </div>
            <div className="w-full flex items-center gap-4">
              {/* <PDAffiliateMerchantForm 
              // pass merchant codes here and get onChange event
                initialMerchantItems={[]}
              /> */}
            </div>
            <div className="w-full flex items-center gap-4">
              <FormControl sx={{ width: "100%" }}>
                <Select
                  className="bg-gray-50 h-11 text-gray-900 sm:text-xs text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 mt-4"
                  multiple
                  displayEmpty
                  value={category}
                  onChange={handleSelectChange}
                  inputProps={{ "aria-label": "Without label" }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <p className="text-gray-400 text-sm">
                          {text("affiliate_register_category")}
                        </p>
                      );
                    }

                    return selected.join(", ");
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem disabled value="">
                    <em>{text("affiliate_register_category")}</em>
                  </MenuItem>

                  {allPlatforms?.platforms
                    .filter((platform) => platform.uuid === platformId)[0]
                    ?.category_list?.map((list) => {
                      const category_list = list;
                      return (
                        <MenuItem
                          className="text-sm text-neutral-500"
                          key={category_list}
                          value={category_list}
                        >
                          <Checkbox
                            checked={category.indexOf(category_list) > -1}
                          />
                          <ListItemText
                            className="text-sm"
                            primary={category_list}
                          />
                          <IconButton
                            onClick={(e) =>
                              handleOnDeleteCategory(e, category_list)
                            }
                          >
                            <Delete className="text-slate-400" />
                          </IconButton>
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </div>
            <>
              <TextareaAutosize
                id={htmlIds.input_platform_details_affiliates_story_details}
                placeholder="Store details"
                className="mt-5 border-slate-400 h-11 rounded-l-lg rounded-tr-lg w-full placeholder:text-sm"
                {...register("store_details", {
                  required: text("affiliate_register_store_details_error"),
                })}
              />
            </>
            {isLoaded && (
              <>
                <StandaloneSearchBox
                  onLoad={(ref) => (inputRef.current = ref)}
                  onPlacesChanged={handlePlaceChanged}
                >
                  <InputTextWithIcon
                    id={htmlIds.input_platform_details_affiliates_location}
                    error={errors?.location?.message}
                    type="location"
                    className="justify-between"
                    inputClassName="flex-1"
                    labelFor="affiliate_register_location"
                    // labelText="affiliate_register_location"
                    {...register("location", {
                      required: text("affiliate_register_location_error"),
                    })}
                    placeholder="affiliate_register_location_placeholder"
                    icon={
                      <Image
                        width={20}
                        height={20}
                        src="/images/location-icon.svg"
                        alt="Location Icon"
                        className="flex justify-end ml-10"
                      />
                    }
                  />
                </StandaloneSearchBox>
                <div className="w-full mt-5">
                  <InputText
                    id={htmlIds.input_platform_details_affiliates_name}
                    error={errors?.url?.message}
                    type="url"
                    labelFor="url"
                    {...register("map_link", {})}
                    placeholder="affiliate_register_url_placeholder"
                  />
                </div>
                <GoogleMap
                  zoom={15}
                  center={address}
                  mapContainerStyle={mapContainerStyle}
                  id="map"
                  onClick={handleMapClick}
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
              </>
            )}
            <div className="flex mt-8 gap-5">
              <button
                onClick={handleClose}
                type="reset"
                className="w-full rounded-md border h-11 border-transparent bg-slate-200  text-sm font-medium text-slate-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {text("affiliate_register_cancel")}
              </button>
              <button
                id={
                  htmlIds.btn_platform_details_affiliates_affiliate_register_submit
                }
                disabled={isLoading}
                type="submit"
                className="w-full h-11 bg-blue-500 text-white rounded-md"
              >
                {isLoading && <Spinner />}
                {text("affiliate_update_disable")}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
}

export default forwardRef(PDUpdateStore);
