import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useLocale } from "locale";
import {
  IDeclinePlatformRequestsErr,
  useDeclinePlatformRequest,
} from "api/hooks";
import { htmlIds } from "@cypress/utils/ids";
import { useDialog } from "@common/context";
import { Spinner } from "@common/components";

interface ButtonApprovePlatformProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onUpdated?: () => void;
}

const ButtonDeclinePlatform = (props: ButtonApprovePlatformProps) => {
  const { confirmDialog } = useDialog();
  const { text } = useLocale();
  const { data, onUpdated } = props;

  const { mutateAsync: declinePlatformRequest, isLoading: submitting } =
    useDeclinePlatformRequest();

  const handleConfirmationModal = () => {
    confirmDialog({
      title: text("confirmation"),
      content: text("platform_requests_decline_confirmation"),
      onOk: async () => {
        declinePlatformRequest({
          platform_uuid: String(data.uuid),
        })
          .then(() => {
            toast(text("platform_requests_decline_successfully_toast"), {
              type: "success",
            });
            onUpdated?.();
          })
          .catch((err: IDeclinePlatformRequestsErr) => {
            toast(err?.response?.data?.message, { type: "error" });
          });
      },
    });
  };

  return (
    <button
      id={htmlIds.btn_platforms_request_decline_request}
      className={
        "flex items-center justify-center text-sm text-red-600 border-solid border-2 border-red-600 bg-red-100 rounded-full h-8 w-8 underline decoration-solid"
      }
      onClick={handleConfirmationModal}
      aria-label="cancel icon"
    >
      {submitting ? (
        <Spinner className="!mr-0" />
      ) : (
        <XMarkIcon className="w-5 stroke-2" />
      )}
    </button>
  );
};

export default ButtonDeclinePlatform;
