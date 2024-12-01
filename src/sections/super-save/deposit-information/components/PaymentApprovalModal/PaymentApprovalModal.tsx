import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { PaymentApprovalModalRef, Info } from "../PaymentApprovalModal/types";
import { useApproveDepositRequest } from "api/hooks";
import { useLocale } from "locale";
import { DataRow } from "@common/components";
import { queryClient } from "api";
import { toast } from "react-toastify";
import FormFooter from "@common/components/FormFooter";
import { htmlIds } from "@cypress/utils/ids";
import CustomDialog from "@common/components/CustomDialog";


function PaymentApprovalModal(
    {
        onSubmit,
        refetch,
        status,
        setStatus,
    }: {
        onSubmit: () => void;
        refetch: () => void,
        status: string,
        setStatus: (value: string) => void,
    },
    ref: Ref<PaymentApprovalModalRef>,

) {
    const { text } = useLocale();
    const [open, setOpen] = useState(false);
    const [info, setInfo] = useState<Info | null>(null);
    const { mutateAsync: approveRequest } = useApproveDepositRequest();
    const [confirmLoading, setConfirmLoading] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            open: (_info) => {
                setInfo(_info);
                setStatus("approved");
                setOpen(true);
            },
        }),
        [],
    );

    const onClose = () => {
        setInfo(null);
        setOpen(false);
    };

    const handleConfirm = async () => {
        setConfirmLoading(true);
        try {
            if (status === "approved") {
                await approveRequest({
                    request_ids: [info?.id] as string[],
                });
                toast.success(`${text("deposit_information_payment")} ${text("deposit_information_payment_approved")}`);
                refetch();
                setStatus("unselected");
                queryClient.invalidateQueries("deposit-requests");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.result || text("toast_error_something_went_wrong_try_again"));
        } finally {
            setConfirmLoading(false);
            onSubmit();
            onClose();
        }
    };

    return (
        <CustomDialog maxWidth="sm" open={open} onClose={onClose} titleText={text("deposit_information_status_approve_transaction")}>
            <div className="border overflow-auto border-1">
                <DataRow
                    label={text("payment_apply_modal_user_name_title")}
                    value={<p>{info?.name}</p>}
                />
                <DataRow
                    label={text("deposit_information_column_request_id")}
                    value={<p>{info?.request_id}</p>}
                />
                <DataRow
                    label={text("payment_apply_modal_email_title")}
                    value={<p>{info?.email}</p>}
                />
                <DataRow
                    label={text("deposit_information_column_phone_number")}
                    value={<p>{info?.phone}</p>}
                />
            </div>
            <div className="flex gap-2 justify-center mt-4 ">
                <FormFooter
                    handleClose={onClose}
                    loading={confirmLoading}
                    cancelText={text("payment_apply_modal_cancel")}
                    submitText={text("deposit_information_status_approve")}
                    disabled={confirmLoading}
                    onSubmit={handleConfirm}
                    submitBtnId={htmlIds.btn_confirmation_dialog_yes}
                    cancelBtnId={htmlIds.btn_confirmation_dialog_no}
                />
            </div>
        </CustomDialog>
    );
}

export default forwardRef(PaymentApprovalModal);
