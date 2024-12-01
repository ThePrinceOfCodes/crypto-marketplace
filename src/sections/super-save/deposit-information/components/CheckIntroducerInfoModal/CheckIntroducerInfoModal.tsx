import { DataRow } from "@common/components";
import { Box } from "@mui/material";
import { useLocale } from "locale";
import React, {
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  CheckIntroducerInfoGrid,
  ICheckIntroducerInfoGridRef,
} from "./components/CheckIntroducerInfoGrid";
import {
  IDepositRequest,
  IUpdateIntroducerInfoRequestRsq,
  useUpdateIntroducerInfoRequest,
} from "api/hooks";
import debounce from "lodash/debounce";
import { GridValidRowModel } from "@mui/x-data-grid-pro";
import { queryClient } from "api";
import { toast } from "react-toastify";
import { determineRequestType } from "@common/utils/helpers";
import { useDialog } from "@common/context";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type CheckIntroducerInfoModalRef = {
  open: () => void;
};

export type IntroducerInfoObj = {
  type: "recommend_to" | "be_recommended";
  name: string;
  phone: string;
  percentage: string;
};

export type IntroducerInfoDepositDetails = {
  uuid: string;
  name: string;
  email: string;
  credit_sale_permission: IDepositRequest["credit_sale_permission"];
  super_save_count: IDepositRequest["super_save_count"];
  created_by: IDepositRequest["created_by"];
  introducer_info: IntroducerInfoObj[];
  community_permission: IDepositRequest["community_permission"];
};

function CheckIntroducerInfoModal(
  {
    depositDetails,
    refetchList,
  }: {
    depositDetails: IntroducerInfoDepositDetails;
    refetchList: (newData: IntroducerInfoObj[]) => void;
  },
  ref: Ref<CheckIntroducerInfoModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [gridEditMode, setGridEditMode] = useState(false);

  const { confirmDialog } = useDialog();

  const gridRef = useRef<ICheckIntroducerInfoGridRef | null>(null);

  const _introducerInfoData = depositDetails.introducer_info;

  const { mutateAsync: updateIntroducerInfoRequest } =
    useUpdateIntroducerInfoRequest();

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const onClose = () => {
    if (gridEditMode) {
      const isCloseConfirm = confirm(
        text("deposit_information_introducer_info_close_confirm"),
      );
      if (!isCloseConfirm) {
        return;
      }
    }
    setOpen(false);
  };

  const convertTableDataToReqData = (
    introducerInfoData: GridValidRowModel[],
  ): IUpdateIntroducerInfoRequestRsq => {
    return {
      request_id: depositDetails.uuid,
      introducer_info_name: introducerInfoData.map((item) => item.name),
      introducer_info_phone: introducerInfoData.map((item) => item.phone),
      introduction_info_percentage: introducerInfoData.map(
        (item) => item.percentage,
      ),
      introduction_info_type: introducerInfoData.map((item) => item.type),
      introducer_super_save_request_id: introducerInfoData.map(
        (item) => item.request_id,
      ),
      introduction_info_referral_code: introducerInfoData.map(
        (item) => item.referral_code,
      ),
    };
  };

  const checkValidation = (introducerInfoData: GridValidRowModel[]) => {
    let isValidationError = null;

    introducerInfoData.forEach((item) => {
      const requiredFieldError = text(
        "deposit_information_introducer_info_validation_error",
      );
      if (!item.type) {
        isValidationError = requiredFieldError;
      }
      if (item.type === "recommend_to") {
        if (!item.percentage) {
          isValidationError = requiredFieldError;
        }
      }
      if (!item.name) {
        isValidationError = text(
          "deposit_information_introducer_info_phone_validation_error",
        );
      }
      // check total percentage is not more than 100
      const totalPercentage = introducerInfoData.reduce(
        (acc, curr) =>
          acc +
          (curr.type === "recommend_to"
            ? curr.percentage
              ? Number(curr.percentage)
              : 0
            : 0),
        0,
      );
      const isRecommendedToContains = introducerInfoData.some(
        (item) => item.type === "recommend_to",
      );
      if (totalPercentage > 100) {
        isValidationError = text(
          "deposit_information_introducer_info_validation_error_percentage_greater",
        );
      }

      if (isRecommendedToContains && totalPercentage < 100) {
        isValidationError = text(
          "deposit_information_introducer_info_validation_error_percentage_less",
        );
      }
    });

    return isValidationError;
  };

  const checkPhoneValidationError = (
    introducerInfoData: GridValidRowModel[],
  ) => {
    const emptyPhoneNumberRecords: GridValidRowModel[] = [];
    introducerInfoData.forEach((item) => {
      if (!item.phone?.trim()) {
        emptyPhoneNumberRecords.push(item);
      }
    });
    if (emptyPhoneNumberRecords.length > 0) {
      const removedEmptyIntroducer = introducerInfoData.filter((eachItem) =>
        eachItem.phone?.trim(),
      );
      confirmDialog({
        title: "Confirmation",
        content: `${text(
          "deposit_information_introducer_info_empty_delete_message_pre",
        )} ${emptyPhoneNumberRecords.length} ${text(
          "deposit_information_introducer_info_empty_delete_message_post",
        )}?`,
        onOk: async () => {
          gridRef?.current?.setRows(removedEmptyIntroducer);
        },
      });
      return true;
    }
    return false;
  };

  const debouncedHandleOnUpdateIntroducers = debounce(
    async (introducerInfoData: GridValidRowModel[]) => {
      const hasNoChange =
        JSON.stringify(introducerInfoData) ===
        JSON.stringify(_introducerInfoData);
      if (hasNoChange) {
        return;
      }
      const isPhoneValidationError =
        checkPhoneValidationError(introducerInfoData);
      if (isPhoneValidationError) {
        gridRef?.current?.startEditMode();
        return;
      }
      const isValidationError = checkValidation(introducerInfoData);
      if (isValidationError) {
        toast(isValidationError, {
          type: "error",
        });
        gridRef?.current?.startEditMode();
        return;
      }
      const convertedReqData = convertTableDataToReqData(introducerInfoData);
      updateIntroducerInfoRequest(convertedReqData, {
        onSuccess(res) {
          refetchList(introducerInfoData as IntroducerInfoObj[]);
          toast(res?.result || "Success", {
            type: "success",
          });
          gridRef?.current?.stopEditMode();
          queryClient.invalidateQueries("deposit-requests");
        },
      }).catch((err) => {
        toast(err?.response?.data?.result || err?.response?.data?.error || "Error", {
          type: "error",
        });
        gridRef?.current?.startEditMode();
      });
    },
    500,
  );

  const handleOnUpdateIntroducers = (
    introducerInfoData: GridValidRowModel[],
  ) => {
    debouncedHandleOnUpdateIntroducers(introducerInfoData);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("deposit_information_introducer_info_modal_title")}
      maxWidth="xl"
      fullWidth={false}
    >
      <Box className="lg:w-[972px]"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box className="border overflow-x-auto">
          <DataRow
            label={text(
              "deposit_information_introducer_info_consent_request_id",
            )}
            value={<p>{depositDetails?.uuid}</p>}
          />
          <DataRow
            label={text(
              "deposit_information_introducer_info_consent_user_name",
            )}
            value={<p>{depositDetails?.name}</p>}
          />
          <DataRow
            label={text("deposit_information_introducer_info_consent_email")}
            value={<p>{depositDetails?.email}</p>}
          />
          <DataRow
            label={text(
              "deposit_information_introducer_info_consent_request_type",
            )}
            value={
              <p>
                {determineRequestType(
                  {
                    credit_sale_permission: depositDetails?.credit_sale_permission,
                    super_save_count: depositDetails?.super_save_count,
                    created_by: depositDetails?.created_by,
                    community_permission: depositDetails?.community_permission,
                  },
                  text,
                )}
              </p>
            }
          />
        </Box>
        <CheckIntroducerInfoGrid
          ref={gridRef}
          rows={
            _introducerInfoData?.length
              ? _introducerInfoData?.map((item, index) => ({
                ...item,
                no: index + 1,
                id: index + 1,
                // trim the percentage sign for exception handling
                percentage: item.percentage?.toString().replace("%", ""),
              }))
              : []
          }
          onUpdateIntroducers={handleOnUpdateIntroducers}
          onEditModeChange={(isEditMode) => setGridEditMode(isEditMode)}
          introducerCreditInfo={{
            credit_sale_permission: depositDetails?.credit_sale_permission,
          }}
        />
      </Box>
      <Box className="w-full flex justify-center mt-3">
        {!gridEditMode && (
          <FormFooter
            showCancelButton={false}
            onSubmit={onClose}
            submitText={text("view_consent_history_ok")}
            sx={{ width: "144px" }}
          />)}
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(CheckIntroducerInfoModal);
