import React, { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import _debounce from "lodash/debounce";
import { CommunityProp, IGetUserCommunitiesRes, useGetSuperUserDetail, useGetUserCommunityHistory } from "api/hooks";
import { useLocale } from "locale";
import { DataRow, DateFormatter, Spinner } from "@common/components";
import { inViewport } from "@common/utils/helpers";
import CustomDialog from "@common/components/CustomDialog";
import { CommunityHistoryDialogProps } from "./types";
import { Box } from "@mui/material";
import FormFooter from "@common/components/FormFooter";

export type CommunityHistoryDialogRef = {
    open: () => void;
};

const sharedColDef: GridColDef = {
    field: "",
    sortable: true,
    disableColumnMenu: true,
};

function CheckCommunityHistoryDialog(
    props: CommunityHistoryDialogProps,
    ref: Ref<CommunityHistoryDialogRef>,
) {
    const { user, onClose: propsOnClose } = props;
    const { text } = useLocale();
    const prevScrollTopRef = useRef(0);
    const [open, setOpen] = useState(false);
    const [lastId, setLastId] = useState<string>();
    const [userCommunityHistoryList, setUserCommunityHistoryList] = useState<CommunityProp[]>();
    const [lastCreatedAt, setLastCreatedAt] = useState<string>();
    const { data: user_details, isFetching: communityUserLoading } = useGetSuperUserDetail({ email: user?.user_email }, {
        enabled: !!user?.user_id,
    });

    const { isFetching, data: userCommunityHistoryData } = useGetUserCommunityHistory({
        limit: 25,
        user_id: user?.user_id || "",
        lastId,
        createdAt: lastCreatedAt,
    }, {
        onSuccess: (data: IGetUserCommunitiesRes) => {
            setUserCommunityHistoryList((prev) => [...(prev || []), ...data.dataList]);
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debouncedOnScroll = _debounce((e: any) => {
        const currentScrollTop = e?.target?.scrollTop;
        // check if user scrolls down
        if (currentScrollTop > prevScrollTopRef.current) {
            if (!!userCommunityHistoryData && userCommunityHistoryData.hasNext) {
                const el = document.querySelector(
                    `div[data-id="${userCommunityHistoryData.lastId}"]`,
                );
                // if last element is in viewport, fetch more data
                if (el && inViewport(el)) {
                    setLastId(userCommunityHistoryData.lastId);
                    setLastCreatedAt(userCommunityHistoryData.createdAt);
                }
            }
        }
        prevScrollTopRef.current = currentScrollTop;
    }, 500);

    useImperativeHandle(
        ref,
        () => ({
            open: () => setOpen(true),
        }),
        [],
    );

    const onClose = () => {
        setOpen(false);
        setLastId(undefined);
        setLastCreatedAt(undefined);
        if (propsOnClose) {
            propsOnClose();
        }
    };

    const columns: GridColDef[] = [
        {
            ...sharedColDef,
            field: "no",
            headerName: text("view_commitment_information_header_no"),
            maxWidth: 50,
            disableReorder: true
        },
        {
            ...sharedColDef,
            field: "user_id",
            headerName: text("community_history_user_id"),
            maxWidth: 150,
            disableReorder: true,
            renderCell: ({ row }) =>
                row.user_id ? (
                    <p className="truncate">
                        <DateFormatter
                            value={row.user_id}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                ),
        },
        {
            ...sharedColDef,
            field: "old_community",
            headerName: text("community_history_old_community"),
            minWidth: 150,
            width: 150,
            renderCell: ({ row }) =>
                row.old_community ? (
                    <p className="truncate">
                        {row.old_community}
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                ),
        },
        {
            ...sharedColDef,
            field: "new_community",
            headerName: text("community_history_new_community"),
            minWidth: 150,
            width: 150,
            renderCell: ({ row }) =>
                row.new_community ? (
                    <p className="truncate">
                        <DateFormatter
                            value={row.new_community}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                ),
        },
        {
            ...sharedColDef,
            field: "created_by",
            headerName: text("community_history_created_by"),
            minWidth: 100,
            width: 100,
            renderCell: ({ row }) =>
                row.created_by ? (
                    <p className="truncate">
                        {row.created_by}
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                ),
        },
        {
            ...sharedColDef,
            field: "createdAt",
            headerName: text("community_history_created_at"),
            minWidth: 150,
            width: 150,
            renderCell: ({ row }) =>
                row.createdAt ? (
                    <p className="truncate flex-wrap">
                        <DateFormatter
                            value={row.createdAt}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                ),
        },
        {
            ...sharedColDef,
            field: "updatedAt",
            headerName: text("community_history_updated_at"),
            minWidth: 150,
            width: 150,
            renderCell: ({ row }) => {
                return row.updatedAt ? (
                    <p className="truncate">
                        <DateFormatter
                            value={row.updatedAt}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                );
            },
        },
        {
            ...sharedColDef,
            field: "action_by",
            headerName: text("community_history_action_by"),
            minWidth: 100,
            width: 100,
            renderCell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="pl-2">{row.action_by}</span>
                    </div>
                );
            },
        },
        {
            ...sharedColDef,
            field: "action_date",
            headerName: text("community_history_action_date"),
            minWidth: 150,
            width: 150,
            renderCell: ({ row }) => {
                return row.action_date ? (
                    <p className="truncate">
                        <DateFormatter
                            value={row.action_date}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </p>
                ) : (
                    <p className="truncate">N/A</p>
                );
            },
        },
    ];

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            titleText={text("view_community_history_dialog_title")}
            maxWidth="lg"
            fullWidth={false}
        >
            <Box className="lg:w-[835px]"
                sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
            >
                {communityUserLoading ? (
                    <Box className="flex justify-center items-center h-full">
                        <Spinner size={8} />
                    </Box>
                ) : (
                    <Box className="border overflow-x-auto">
                        <DataRow
                            label={text("view_education_history_dialog_user_name")}
                            value={<p>{user_details?.msq_name || "---"}</p>}
                        />
                        <DataRow
                            label={text("view_education_history_dialog_user_email")}
                            value={<p>{user_details?.email || "---"}</p>}
                        />
                        <DataRow
                            label={text("view_education_history_dialog_user_phone")}
                            value={<p>{user_details?.phone_number || "---"}</p>}
                        />
                    </Box>
                )}
                <Box className="h-64 mt-4" onScrollCapture={debouncedOnScroll}>
                    <DataGridPro
                        getRowId={(row) => row.uuid}
                        rows={userCommunityHistoryList?.map((item, index) => ({
                            id: index,
                            ...item,
                            no: index + 1,
                        })) || []}
                        paginationMode="server"
                        rowCount={[]?.length || 0}
                        columns={columns}
                        loading={isFetching}
                        hideFooter
                    />
                </Box>
                <Box className="w-full flex justify-center mt-3">
                    <FormFooter
                        loading={communityUserLoading}
                        handleClose={onClose}
                        submitText={text("view_commitment_information_ok")}
                        cancelText={text("user_withdrawal_cancel")}
                        onSubmit={onClose}
                        showCancelButton={false}
                        sx={{ width: "160px" }}
                    />
                </Box>
            </Box>
        </CustomDialog >
    );
}

export default forwardRef(CheckCommunityHistoryDialog);
