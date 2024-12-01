import { Spinner } from "@common/components";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface ButtonEnableAffiliateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onUpdated?: () => void;
}

const ButtonEnableAffiliate = (props: ButtonEnableAffiliateProps) => {
  const { data, onUpdated } = props;
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      // api doesnt exist
      // await api.patch('affiliate/merchant/', {
      //   code: String(data.code),
      //   enabled: !data.enabled,
      // })
      toast(`${data.enabled ? "Disable" : "Enable"} affiliate successfully`, {
        type: "success",
      });
      if (onUpdated) onUpdated();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err?.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      className={`flex items-center text-xs px-2 h-6 ${
        data.enabled ? "bg-gray-500" : "bg-blue-500"
      } text-white rounded-md`}
      onClick={onSubmit}
    >
      <span>{submitting ? <Spinner /> : data.enabled ? "View" : "View"}</span>
    </button>
  );
};

export default ButtonEnableAffiliate;
