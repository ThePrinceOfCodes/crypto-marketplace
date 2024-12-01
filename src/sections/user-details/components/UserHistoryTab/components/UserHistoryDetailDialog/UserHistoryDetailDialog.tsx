import {
    Box,
    Typography,
} from "@mui/material";
import { useLocale } from "locale";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { UserHistoryDetailDialogProps, UserHistoryDetailDialogRef } from "./types";
import { DataRow } from "@common/components";
import { IUserLogChangedVariables } from "api/hooks";
import CustomDialog from "@common/components/CustomDialog";

function UserHistoryDetailDialog(
    props: UserHistoryDetailDialogProps,
    ref: Ref<UserHistoryDetailDialogRef>,
) {
    const { onClose, data } = props;
    const { text } = useLocale();
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        setOpen(false);
    };

    useImperativeHandle(
        ref,
        () => ({
            open: () => {
                setOpen(true);
            },
        }),
        [],
    );
    const content = JSON.parse(data?.content || "{}");
    return (
        <CustomDialog
            open={open}
            onClose={handleClose}
            titleText={text("users_history_details_dialog_title")}
            maxWidth="lg"
            fullWidth={false}
        >
            <Box
                sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
            >
                <div className="lg:w-[552px]">
                    {
                        content.changedVariables && (
                            <>
                                <Typography className="mb-2">
                                    {text("users_history_details_dialog_title_changed_variables")}
                                </Typography>
                                <div className="border overflow-x-auto">
                                    {content.changedVariables?.map((item: IUserLogChangedVariables) => (
                                        <DataRow
                                            key={item.key}
                                            label={item.label ?? "---"}
                                            value={<p>{item.value ?? "---"}</p>}
                                        />
                                    ))}
                                </div>
                            </>
                        )
                    }
                    <Typography className="my-2">
                        {text("users_history_details_dialog_title_details")}
                    </Typography>
                    <div className="border overflow-x-auto">
                        <DataRow
                            label={text(
                                "users_history_details_consent_memo",
                            )}
                            value={<p>{data?.memo || "---"}</p>}
                        />
                        <DataRow
                            label={text(
                                "users_history_details_consent_manager_name",
                            )}
                            value={<p>{data?.admin_name || "---"}</p>}
                        />
                        <DataRow
                            label={text(
                                "users_history_details_consent_manager_email",
                            )}
                            value={<p>{data?.admin_id || "---"}</p>}
                        />
                    </div>
                </div>
            </Box>
        </CustomDialog>
    );
}

export default forwardRef(UserHistoryDetailDialog);
