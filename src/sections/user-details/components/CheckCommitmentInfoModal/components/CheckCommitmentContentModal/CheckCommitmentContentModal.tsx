import {
    Box,
} from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { useLocale } from "locale";
import { IGetCommitmentReferralResult } from "api/hooks";
import { DateFormatter } from "@common/components";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type CheckCommitmentContentModalRef = {
    open: () => void;
};

export type CheckCommitmentContentModalProps = {
    data: IGetCommitmentReferralResult | null;
    onClose: () => void;
}

function CheckCommitmentContentModal(
    { data, onClose: onCloseProps }: CheckCommitmentContentModalProps,
    ref: Ref<CheckCommitmentContentModalRef>,
) {
    const { text } = useLocale();
    const [open, setOpen] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            open: () => setOpen(true),
        }),
        [],
    );

    const onClose = () => {
        setOpen(false);
        if (onCloseProps) {
            onCloseProps();
        }
    };

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            titleText={text("view_commitment_content_title")}
            maxWidth="md"
            fullWidth={false}
        >
            <Box
                sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
            >
                <div className="md:w-[670px]">
                    <p className="pb-2">
                        {text("view_commitment_content_heading_confirmation_terms")}
                    </p>
                    <p className="pb-2 text-red-500">
                        {text("view_commitment_content_heading_confirmation_letter")}
                    </p>
                    <p>
                        <span className="font-bold">
                            {text("view_commitment_content_heading_enrollment_data")}
                        </span>
                        <span>{
                            data?.createdAt ? (
                                <DateFormatter value={data?.createdAt} format="YYYY.MM.DD" />
                            ) : ("---")
                        }</span>
                    </p>
                    <p className="my-2">
                        <span className="font-bold">
                            {text("view_commitment_content_heading_introducer")}
                        </span>
                        <span>{(data?.from_user_name || "---") + " / " + (data?.from_user_phone || "---")}</span>
                    </p>
                    <p>
                        <span className="font-bold">

                            {text("view_commitment_content_heading_introduced_by")}
                        </span>
                        <span>{data?.to_user_name || "---"}</span>
                    </p>
                    <p></p>
                </div>
                <Box sx={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                    <FormFooter
                        showCancelButton={false}
                        onSubmit={onClose}
                        submitText={text("view_commitment_information_ok")}
                        sx={{ width: "144px" }}
                    />
                </Box>
            </Box>
        </CustomDialog>
    );
}

export default forwardRef(CheckCommitmentContentModal);
