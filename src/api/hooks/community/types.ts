import { AxiosResponse, AxiosError } from "axios";
import { FieldConfig, FieldInputProps, FormikErrors, FormikTouched } from "formik";

type AcceptedValueTypes = string | number | boolean;
export interface IPostCommunityForm {
    name: string;
    country: string;
    representative: string;
    email: string;
    phone_number: string;
    referral_code: number;
    guide_info?: string;
    location?: {
        lat: null | number;
        lng: null | number;
    } | null;
}
export interface Country {
  name: string;
  value: string;
}

export interface SetFieldValue {
  (field: string, value: string, shouldValidate?: boolean): Promise<void | FormikErrors<IPostCommunityForm>>;
}

export interface SetFieldError {
  (field: string, message: string | undefined): void;
}
interface GetFieldPropsType {
  <Value = AcceptedValueTypes>(props: string | FieldConfig<Value>): FieldInputProps<Value>;
}
export interface GetPropsType {
  (
    field: string,
    touched: FormikTouched<IPostCommunityForm>,
    errors: FormikErrors<IPostCommunityForm>,
    getFieldProps: GetFieldPropsType
  ): {
    error: boolean;
    helperText: string | undefined;
    [key: string]: any;
  };
}
export interface CommunityObject extends IPostCommunityForm {
    createdAt: string;
    created_by: string;
    status: number;
    updatedAt: string;
    uuid: string;
};

export interface IGetCommRes {
    hasNext: boolean;
    lastId: string;
    communityListData: CommunityObject[];
};

export type IGetCommunityFormResponse = AxiosResponse<{ message: string }>

export type IGetCommunityFormError = AxiosError<{ result: string }>

export type IGetCommDeleteErr = AxiosError<{ err: string }>

export type IGetCommDeleteRes = AxiosResponse<{ message: string }>
