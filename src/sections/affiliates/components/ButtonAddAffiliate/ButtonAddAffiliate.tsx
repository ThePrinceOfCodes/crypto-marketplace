import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { InputText, Spinner } from "@common/components";

interface ButtonAddAffiliateProps {
  onAdded?: () => void;
}

const ButtonAddAffiliate = (props: ButtonAddAffiliateProps) => {
  const { onAdded } = props;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // api doesnt exist
      // await api.post('affiliate/merchant/', {
      //   code: data.code,
      //   name: data.name,
      //   rate: data.rate,
      // })
      toast("Add new affiliate successfully", { type: "success" });
      setOpen(false);
      if (onAdded) onAdded();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err?.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        className="flex items-center text-sm px-4 h-10 bg-blue-500 text-white rounded-md"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="w-5 stroke-2 mr-2" />
        <span>Add new affiliate</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add affiliate</DialogTitle>
        <div className="w-96 px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputText
              error={errors?.code?.message}
              labelFor="code"
              labelText="Code"
              {...register("code", {
                required: "Code is required",
              })}
            />
            <InputText
              error={errors?.name?.message}
              labelFor="name"
              labelText="Name"
              {...register("name", {
                required: "Name is required",
              })}
            />
            <InputText
              error={errors?.rate?.message}
              type="number"
              labelFor="rate"
              labelText="Rate"
              {...register("rate", {
                required: "Rate is required",
              })}
            />
            <button
              disabled={submitting}
              type="submit"
              className="w-full mt-5 h-10 bg-blue-500 text-white rounded-md"
            >
              {submitting && <Spinner />} Add
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default ButtonAddAffiliate;
