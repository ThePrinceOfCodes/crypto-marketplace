export interface IMerchantCodeObj {
  merchant_code: string;
  merchant_company: string;
}

export interface IPDAfiliatesMerchantFormProps {
  onChange?: (value: IMerchantCodeObj[]) => void;
  initialMerchantItems?: IMerchantCodeObj[];
}
