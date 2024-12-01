
import * as Yup from "yup";

type ValidatorType =
  | Yup.StringSchema<string | undefined, object>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Yup.ArraySchema<undefined | any[] | string[] | null, object, "">
  | Yup.NumberSchema<number | undefined | null, object>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Yup.MixedSchema<any>;

function updateSchema(fields: Array<string>, validator: ValidatorType) {
  const schema: { [key: string]: ValidatorType } = {};

  fields.forEach((field: string) => {
    schema[field] = validator;
  });

  return schema;
}

const requiredStringValidator = (fields: Array<string>, errorMessage: string) => {
  const validator = Yup.string().trim().required(errorMessage);

  return updateSchema(fields, validator);
};

const requiredPhoneValidator = (errorMessage: string) => {
  return Yup.string().trim().required(errorMessage)
    .matches(/^\d{8,20}$/, errorMessage);
};
const requiredAdminPhoneValidator = (errorMessage: string) => {
  return Yup.string().trim().required(errorMessage)
    .matches(/^\+?\d{8,20}$/, errorMessage);
};
const requiredCommunityPhoneValidator = (errorMessage: string) => {
  return Yup.string().trim().required(errorMessage)
    .matches(/^[+\-\d#*]{8,20}$/, errorMessage);
};

const requiredMultiselectValidator = (
  fields: Array<string>,
  errorMessage: string,
) => {
  const validator = Yup.array()
    .of(Yup.string().required())
    .required("This field is required")
    .min(1, errorMessage);

  // error
  return updateSchema(fields, validator);
};

const requiredStringURLValidator = (
  fields: Array<string>,
  requiredErrorMessage: string,
  errorMessage: string,
) => {
  const validator = Yup.string()
    .url(errorMessage)
    .required(requiredErrorMessage);

  return updateSchema(fields, validator);
};

const stringURLValidator = (fields: Array<string>, errorMessage: string) => {
  const validator = Yup.string().url(errorMessage);

  return updateSchema(fields, validator);
};

const requiredNumbervalidator = (fields: Array<string>, errorMessage: string) => {
  const validator = Yup.number()
    .min(0, errorMessage)
    .max(99, errorMessage)
    .required(errorMessage);

  return updateSchema(fields, validator);
};

const requiredAccoutNumberValidator = (fields: Array<string>, requiredMessage: string, errorMessage: string,) => {
  const validator =
    Yup.string()
      .matches(/^\d+$/, errorMessage)
      .min(11, errorMessage)
      .max(16, errorMessage)
      .required(requiredMessage);

  return updateSchema(fields, validator);
};

const requiredEmailValidator = (fields: Array<string>, invalidEmail: string, errorMessage: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
  const validator = Yup.string().matches(emailRegex, invalidEmail).required(errorMessage);

  return updateSchema(fields, validator);
};

const requiredFileValidator = (fields: Array<string>, requiredMessage: string, errorMessage: string) => {
  const validator = Yup.mixed()
    .required(requiredMessage).test(
      "fileType",
      errorMessage,
      (value) => {
        if (!value) return true;
        if (!(value instanceof File)) return false;

        // Check file type
        return value.type === "application/pdf";
      });

  return updateSchema(fields, validator);
};

export {
  requiredStringValidator,
  requiredPhoneValidator,
  requiredAdminPhoneValidator,
  requiredCommunityPhoneValidator,
  requiredMultiselectValidator,
  requiredStringURLValidator,
  stringURLValidator,
  requiredNumbervalidator,
  requiredEmailValidator,
  requiredFileValidator,
  requiredAccoutNumberValidator
};

