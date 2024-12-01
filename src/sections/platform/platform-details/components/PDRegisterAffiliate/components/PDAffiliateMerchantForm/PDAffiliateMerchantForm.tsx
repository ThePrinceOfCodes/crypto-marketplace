import { InputSelect, InputText } from "@common/components";
import { PlusIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { CircularProgress } from "@mui/material";
import { useGetPlatformAffiliatesCompanies } from "api/hooks";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { IMerchantCodeObj, IPDAfiliatesMerchantFormProps } from "./types";
import { useLocale } from "locale";

const PDAffiliateMerchantForm = (props: IPDAfiliatesMerchantFormProps) => {
  const { onChange, initialMerchantItems = [] } = props;
  const { text } = useLocale();
  const { data, isFetching: isLoading } = useGetPlatformAffiliatesCompanies();
  const allMerchantCompanies =
    data?.result.map((eachItem) => ({
      label: eachItem.name,
      value: eachItem.name,
    })) || [];
  const [merchantItems, setMerchantItems] = useState<IMerchantCodeObj[]>(
    initialMerchantItems || [],
  );
  const handleAddMore = useCallback(() => {
    setMerchantItems((prev) => [
      ...prev,
      {
        merchant_code: "",
        merchant_company: "",
      },
    ]);
  }, []);

  useEffect(() => {
    if (onChange) onChange(merchantItems);
  }, [merchantItems, onChange]);

  const handleRemoveItem = useCallback((index: number) => {
    setMerchantItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleOnChangeCompany = useCallback((value: string, index: number) => {
    setMerchantItems((prev) => {
      const newItems = [...prev];
      newItems[index].merchant_company = value;
      return newItems;
    });
  }, []);

  const handleOnChangeCode = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
      setMerchantItems((prev) => {
        const newItems = [...prev];
        newItems[index].merchant_code = e.target.value;
        return newItems;
      });
    },
    [],
  );

  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-center mt-1">
        <span>{text("affiliate_merchant_codes")}</span>
        <button
          type="button"
          onClick={handleAddMore}
          disabled={isLoading}
          className="flex items-center text-sm h-8 text-blue-500 rounded-lg ml-4"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          {text("affiliate_merchant_add_more")}
        </button>
      </div>
      <div className="w-full mt-2">
        {isLoading ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          merchantItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-full gap-1 mt-2"
            >
              <div className="w-[45%]">
                <InputSelect
                  className={
                    "h-11 bg-gray-50 w-full border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600"
                  }
                  labelFor="merchantCompany"
                  placeholder="affiliate_merchant_company_code"
                  isRequired={true}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  onChange={(e) => handleOnChangeCompany(e.target.value, index)}
                  value={item.merchant_company}
                  options={allMerchantCompanies}
                />
              </div>
              <div className="w-[45%]">
                <InputText
                  type="text"
                  labelFor="merchantCode"
                  className="w-full"
                  isRequired={true}
                  placeholder="affiliate_merchant_code_placeholder"
                  value={item.merchant_code}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => handleOnChangeCode(e as any, index)}
                />
              </div>
              <div className="w-[10%] h-full flex justify-center align">
                <XCircleIcon
                  onClick={() => handleRemoveItem(index)}
                  className="w-5 text-red-500 cursor-pointer"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PDAffiliateMerchantForm;
