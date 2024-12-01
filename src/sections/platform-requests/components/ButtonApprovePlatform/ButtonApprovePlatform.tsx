import { htmlIds } from "@cypress/utils/ids";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  IApprovePlatformRequestsErr,
  useApprovePlatformRequest,
} from "api/hooks";
import { useLocale } from "locale";
import React from "react";
import { toast } from "react-toastify";
import { useDialog } from "@common/context";
import { Spinner } from "@common/components";

interface ButtonApprovePlatformProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onUpdated?: () => void;
}

const ButtonApprovePlatform = (props: ButtonApprovePlatformProps) => {
  const { confirmDialog } = useDialog();
  const { text } = useLocale();
  const { data, onUpdated } = props;

  const { mutateAsync: approvePlatform, isLoading: submitting } =
    useApprovePlatformRequest();

  const handleConfirmationModal = () => {
    confirmDialog({
      title: text("confirmation"),
      content: text("platform_requests_approve_confirmation"),
      onOk: async () => {
        approvePlatform({ platform_uuid: String(data.uuid) })
          .then(() => {
            toast(text("platform_requests_approved_successfully_toast"), {
              type: "success",
            });
            onUpdated?.();
          })
          .catch((err: IApprovePlatformRequestsErr) => {
            toast(err?.response?.data?.message, { type: "error" });
          });
      },
    });
  };

  return (
    <button
      id={htmlIds.btn_platforms_request_approve_request}
      className={
        "flex items-center justify-center text-sm text-green-600 border-solid border-2 border-green-600	bg-green-100 rounded-full h-8 w-8 underline decoration-solid ml-2"
      }
      onClick={handleConfirmationModal}
      aria-label="copy icon"
    >
      <span>
        {submitting ? <Spinner /> : <CheckIcon className="w-5 stroke-2" />}
      </span>
    </button>
  );
};

export default ButtonApprovePlatform;
