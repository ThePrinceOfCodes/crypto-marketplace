import {
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import _debounce from "lodash/debounce";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  SelectChangeEvent,
  Select,
  OutlinedInput,
  MenuItem,
  FormControl,
} from "@mui/material";
import { PDRegisterAffiliate } from "../PDRegisterAffiliate";
import { LocalKeys, useLocale } from "locale";
import {
  PlatformAffiliateType,
  useGetAllPlatforms,
  useGetPlatformAffiliatesCategoryListAdmin,
} from "api/hooks";
import useInitialTabRender from "@common/hooks/useInitialTabRender";
import { PDAffiliatesList } from "./components/PDAffiliatesList";
import PDAAffiliatesInfoDialog from "./components/PDAffiliatesInfoDialog/PDAffiliatesInfoDialog";
import { IPDAffiliatesListRef } from "./components/PDAffiliatesList/types";
import { useAuth } from "@common/context";
import { affiliateCities } from "../PDRegisterAffiliate/affiliateCities";
import { RegisterAffiliateRef } from "../PDRegisterAffiliate/PDRegisterAffiliate";
import { SearchBox } from "@common/components/SearchBox";
import CloseIcon from "@common/icons/CloseIcon";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
interface PDAffiliatesPanelProps {
  platformName: string;
}

function PDAffiliatesPanel({ platformName }: PDAffiliatesPanelProps) {
  const { text: t } = useLocale();
  const router = useRouter();
  const { hasAuth } = useAuth();
  const [value, setValue] = useState(0);
  const { initialRender, setInitialRender } = useInitialTabRender(3);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    "" as string,
  );
  const [searchCity, setSearchCity] = useState<string>("" as string);
  const [visibleAffiliatesInfo, setVisibleAffiliatesInfo] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([""]);

  const pdaffiliatesActivatedListRef = useRef<IPDAffiliatesListRef>(null);
  const pdaffiliatesDeactivatedListRef = useRef<IPDAffiliatesListRef>(null);
  const pdaffiliatesWaitingListRef = useRef<IPDAffiliatesListRef>(null);
  const pdAffiliateRegisterRef = useRef<RegisterAffiliateRef>(null);

  const [text, setText] = useState<string>("");
  const [selectedItem, setSelectedItem] =
    useState<PlatformAffiliateType | null>(null);
  const [selectedAffiliateInfo, setSelectedAffiliateInfo] =
    useState<PlatformAffiliateType | null>(null);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setInitialRender(newValue);
    setValue(newValue);
    setSelectedItem(null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFunc = useCallback(
    _debounce((_text: string) => {
      const text = _text.trim().toLocaleLowerCase();
      setText(text.length === 0 ? "" : text);
    }, 500),
    [],
  );

  const handleSelectItem = useCallback((item: PlatformAffiliateType) => {
    setSelectedItem(item);
  }, []);

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <>
        {value === index && (
          <div
            role="tabpanel"
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            <Box p={3}>{children}</Box>
          </div>
        )}
      </>
    );
  }, []);

  const handleRefetch = useCallback(() => {
    pdaffiliatesActivatedListRef.current?.refetch();
    pdaffiliatesDeactivatedListRef.current?.refetch();
    pdaffiliatesWaitingListRef.current?.refetch();
  }, []);

  const handleAffiliatesShowInfo = useCallback(
    (item: PlatformAffiliateType) => {
      setSelectedAffiliateInfo(item);
      setVisibleAffiliatesInfo(true);
    },
    [],
  );

  const handleOnUpdateStore = useCallback(
    (newSelectedItem: PlatformAffiliateType) => {
      handleSelectItem(newSelectedItem);
      pdAffiliateRegisterRef.current?.openUpdateStore();
    },
    [handleSelectItem],
  );

  const handleOnChangeStoreStatus = useCallback(
    (newSelectedItem: PlatformAffiliateType, isDenyMode = false) => {
      handleSelectItem(newSelectedItem);
      pdAffiliateRegisterRef.current?.openStatusChangeDialog(isDenyMode);
    },
    [handleSelectItem],
  );

  const handleOnDeleteStore = useCallback(
    (newSelectedItem: PlatformAffiliateType, isDeleteMode = false) => {
      handleSelectItem(newSelectedItem);
      pdAffiliateRegisterRef.current?.openDeleteStoreDialog(isDeleteMode);
    },
    [handleSelectItem],
  );

  const allAffiliateCities = affiliateCities.map((city) => {
    return {
      label: t(city as LocalKeys),
      value: city,
    };
  });

  const platformId: string | string[] = router.query.platform || "";

  const { data: allPlatforms } = useGetAllPlatforms(
    { limit: 25, searchKey: platformName }, // Using platformName here
    {
      cacheTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const { data: allAffiliateCategoriesRes } =
    useGetPlatformAffiliatesCategoryListAdmin(null, {
      enabled: true,
    });

  const allAffiliateCategories = useMemo(
    () => allAffiliateCategoriesRes?.data || [],
    [allAffiliateCategoriesRes],
  );

  const handleGetOptions = () => {
    const list = allPlatforms?.platforms.filter(
      (platform) => platform.uuid === platformId,
    )[0]?.category_list || [];
    return list.length ? list : allAffiliateCategories;
  };

  const handleSelectCategories = (
    event: SelectChangeEvent<typeof selectedCategories>,
  ) => {
    const {
      target: { value },
    } = event;
    setSelectedCategories(typeof value === "string" ? value.split(",") : value);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 200,
      },
    },
  };

  const handleBlur = () => {
    if (searchCity.length) {
      setSelectedCity(searchCity);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchCity) {
      setSelectedCity(searchCity);
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-row flex-wrap xl:flex-nowrap justify-between w-full mb-2 gap-2">
        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-center w-full gap-2">
          <SearchBox onChangeFunc={searchFunc} />
          <div className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-2 w-full">
            <Autocomplete
              className="p-2 px-[6px] text-sm bg-gray-50 border text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 "
              noOptionsText={t("affiliate_store_no_city_found")}
              options={allAffiliateCities}
              // noOptionsText={t("affiliate_register_city_placeholder")}
              value={
                t(selectedCity as LocalKeys) as unknown as {
                  label: string;
                  value: string;
                }
              }
              onInputChange={(_event, newInputValue) => {
                setSearchCity(newInputValue);
              }}
              disablePortal
              onChange={(_event, newValue) => {
                setSelectedCity(newValue?.value);
                setSearchCity("");
              }}
              renderInput={(params) => (
                <TextField
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  {...params}
                  inputProps={{
                    ...params.inputProps,
                    className:
                      "text-black text-sm font-normal focus:outline-none rounded-lg bg-gray-50 border border-gray-600 focus:ring-transparent focus:ring-blue-500 focus:border-blue-500",
                  }}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    placeholder: t("affiliate_register_city_placeholder"),
                  }}
                  variant="standard"
                />
              )}
            />

            <FormControl sx={{ width: "100%" }}>
              <Select
                className="w-full py-1  max-h-10 px-[6px] text-sm bg-gray-50  text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 "
                id="multiple-category"
                multiple
                value={selectedCategories.map(
                  (item) => t(item as LocalKeys) as string,
                )}
                onChange={handleSelectCategories}
                inputProps={{ "aria-label": "Without label" }}
                MenuProps={MenuProps}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected[0] === "" && selected.length === 1) {
                    return <em>{t("affiliate_register_category")}</em>;
                  }
                  return selected.slice(1).join(", ");
                }}
                endAdornment={
                  selectedCategories?.length > 1 && (
                    <div onClick={() => { setSelectedCategories([""]); }} className="mr-6 cursor-pointer">
                      <CloseIcon fill={["none", "gray"]} /></div>
                  )
                }
              >
                <MenuItem disabled value=""> 
                  <em>{t("affiliate_register_category")}</em>
                </MenuItem>
                {handleGetOptions()?.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        {hasAuth("platform") && (
          <div className="flex w-full justify-end">
            <PDRegisterAffiliate
              ref={pdAffiliateRegisterRef}
              platformName={platformName}
              refetch={handleRefetch}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              currentAffiliateTab={value}
            />
          </div>
        )}
      </div>
      <div>
        <Tabs
          sx={{
            "& .MuiTabs-scroller": {
              height: "auto !important",
            },
          }}
          className="flex mt-2" value={value} onChange={handleChange}
        >
          <Tab
            label={t("platform_details_tab_affiliates_subtab_activated")}
            className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
          />
          <Tab
            label={t("platform_details_tab_affiliates_subtab_deactivated")}
            className="flex-1 border border-neutral-200  border-solid"
          />
          <Tab
            label={t("platform_details_tab_affiliates_subtab_waiting")}
            className="rounded-r-lg flex-1 border border-neutral-200 border-solid"
          />
        </Tabs>
        <TabPanel value={value} index={0}>
          <PDAffiliatesList
            ref={pdaffiliatesActivatedListRef}
            name={text}
            platform_id={router.query.platform as string}
            onShowInfo={handleAffiliatesShowInfo}
            activated={true}
            isWaiting={false}
            city={selectedCity}
            categories={selectedCategories.slice(1)}
            actionMode={"activated"}
            onUpdateStore={handleOnUpdateStore}
            onDeleteStore={handleOnDeleteStore}
            onChangeStoreStatus={handleOnChangeStoreStatus}
          />
        </TabPanel>
        {initialRender[1] && value === 1 && (
          <TabPanel value={value} index={1}>
            <PDAffiliatesList
              ref={pdaffiliatesDeactivatedListRef}
              name={text}
              platform_id={router.query.platform as string}
              onShowInfo={handleAffiliatesShowInfo}
              activated={false}
              isWaiting={false}
              city={selectedCity}
              categories={selectedCategories.slice(1)}
              actionMode={"deactivated"}
              onUpdateStore={handleOnUpdateStore}
              onDeleteStore={handleOnDeleteStore}
              onChangeStoreStatus={handleOnChangeStoreStatus}
            />
          </TabPanel>
        )}
        {initialRender[2] && value === 2 && (
          <TabPanel value={value} index={2}>
            <PDAffiliatesList
              ref={pdaffiliatesWaitingListRef}
              name={text}
              platform_id={router.query.platform as string}
              onShowInfo={handleAffiliatesShowInfo}
              activated={false}
              isWaiting={true}
              city={selectedCity}
              categories={selectedCategories.slice(1)}
              actionMode={"waiting"}
              onDeleteStore={handleOnDeleteStore}
              onUpdateStore={handleOnUpdateStore}
              onChangeStoreStatus={handleOnChangeStoreStatus}
            />
          </TabPanel>
        )}
        <PDAAffiliatesInfoDialog
          open={visibleAffiliatesInfo}
          data={selectedAffiliateInfo}
          onCancel={() => setVisibleAffiliatesInfo(false)}
        />
      </div>
    </div>
  );
}

export default PDAffiliatesPanel;
