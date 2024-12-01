import React, { Ref, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useGetAdsStats } from "api/hooks";
import { useLocale } from "locale";
import { DataRow, Spinner } from "@common/components";
import CustomDialog from "@common/components/CustomDialog";
import { AdsManagementStatsDialogProps } from "./types";
import { Box, Typography } from "@mui/material";
import FormFooter from "@common/components/FormFooter";
import useResponsive from "@common/hooks/useResponsive";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import CitiesChart from "./CitiesChart";

export type AdsManagementStatsModalRef = {
    open: () => void;
};

function AdsManagementStatsModal(
    props: AdsManagementStatsDialogProps,
    ref: Ref<AdsManagementStatsModalRef>,
) {
    const { slugOrUrl, startAt, endAt: endAtProp } = props;
    const endAt = useMemo(() => endAtProp || new Date().toISOString(), [endAtProp]);
    const { text } = useLocale();
    const [open, setOpen] = useState(false);
    const [shouldFetch, setShouldFetch] = useState(false);
    const statsParams = useMemo(() => ({ slugOrUrl, startAt, endAt }), [slugOrUrl, startAt, endAt]);
    const { data: adsStats, isLoading: adsStatsLoading } = useGetAdsStats(statsParams, undefined, shouldFetch);
    const { isMobile, isTablet, isBigScreen } = useResponsive();

    useImperativeHandle(
        ref,
        () => ({
            open: () => {
                setOpen(true);
                setShouldFetch(true);
            }
        }),
        [],
    );

    const onClose = () => {
        setOpen(false);
    };

    const counterData = useMemo(() => {
        if (!adsStats?.counters) return [];

        return [
            { id: "visits", label: "Visits", value: parseInt(adsStats.counters[0].visits, 10) || 0 },
            { id: "visitors", label: "Visitors", value: parseInt(adsStats.counters[0].visitors, 10) || 0 },
            { id: "referers", label: "Referers", value: parseInt(adsStats.counters[0].referers, 10) || 0 },
        ];
    }, [adsStats]);
    const cityData = useMemo(() => {
        if (!adsStats?.city) return [];

        return adsStats.city.map((city) => ({
            id: city.name,
            label: city.name,
            value: parseInt(city.count, 10) || 0,
        }));
    }, [adsStats]);

    const hasData = counterData.some(item => item.value > 0);

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            titleText={text("view_ads_stats")}
            maxWidth={isMobile ? "sm" : "xl"}
            className="overflow-hidden"
        >
            <Box sx={{
                height: adsStatsLoading? "400px" : isMobile ? "400px" : "450px",
                maxHeight: "calc(100% - 64px)",
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                width: isMobile || isTablet ? "w-fit" : "100%",
            }}>
                {adsStatsLoading ? (
                    <Box className="flex justify-center items-center h-full">
                        <Spinner size={8} />
                    </Box>
                ) : (
                    <>
                        <Box className="mt-4" sx={{ display: "flex", flexDirection: isBigScreen ? "row" : "column", gap: 1, maxWidth: "100%" }}>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_total_visits")}</Typography>
                                {hasData ? (
                                    <PieChart
                                        series={[
                                            {
                                                arcLabel: (item) => `${item.label} (${item.value})`,
                                                arcLabelMinAngle: 45,
                                                data: counterData,
                                            },
                                        ]}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: "white",
                                                fontWeight: "bold",
                                            },
                                        }}
                                        slotProps={{
                                            legend: {
                                                position: {
                                                    vertical: "middle",
                                                    horizontal: "right",
                                                },
                                                labelStyle: { fontSize: 12, width: "5%" },
                                                direction: "column",
                                                itemMarkWidth: 10,
                                                itemMarkHeight: 10,
                                                markGap: 5,
                                                itemGap: 10,
                                                padding: 0,
                                            },
                                        }}
                                        height={isMobile ? 300 : 400}
                                    />
                                ) : (
                                    <Typography variant="h6" align="center">
                                        {text("view_ads_stats_unavailable")}
                                    </Typography>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_city")}</Typography>
                                {cityData.length > 0 ? (
                                    <CitiesChart cityData={cityData}/>
                                ) : (
                                    <Typography variant="h6" align="center">
                                        {text("view_ads_stats_unavailable")}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box className="mt-2" sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1, maxWidth: "100%" }}>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_region")}</Typography>
                                {adsStats?.region?.length ? (
                                    adsStats.region.map((item, index) => (
                                        <DataRow
                                            key={index}
                                            label={item.name || "Unknown"}
                                            value={item.count}
                                            labelConClassName="min-w-0"
                                            valueConClassName="min-w-0"
                                        />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_views")}</Typography>
                                {adsStats?.views?.length ? (
                                    adsStats?.views?.map((item, index) => (
                                        <DataRow key={index} label={item.time || "Unknown"} value={`Visits: ${item.visits}, Visitors: ${item.visitors}`} labelConClassName={isTablet || isMobile ? "w-fit" : ""} valueConClassName="min-w-0" containerConClassName={isTablet || isMobile ? "flex-col" : "flex-row"} />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_referer")}</Typography>
                                {adsStats?.referer?.length ? (
                                    adsStats?.referer?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                        </Box>
                        <Box className="mt-2" sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1, maxWidth: "100%"  }}>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_browser_type")}</Typography>
                                {adsStats?.browserType?.length ? (
                                    adsStats?.browserType?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_language")}</Typography>
                                {adsStats?.language?.length ? (
                                    adsStats?.language?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_slug")}</Typography>
                                {adsStats?.slug?.length ? (
                                    adsStats?.slug?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                        </Box>
                        <Box className="mt-2" sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1, maxWidth: "100%" }}>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_browser")}</Typography>
                                {adsStats?.browser?.length ? (
                                    adsStats?.browser?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_timezone")}</Typography>
                                {adsStats?.timezone?.length ? (
                                    adsStats?.timezone?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">OS</Typography>
                                {adsStats?.os?.length ? (
                                    adsStats?.os?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                        </Box>
                        <Box className="mt-2" sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1, maxWidth: "100%" }}>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_device_type")}</Typography>
                                {adsStats?.deviceType?.length ? (
                                    adsStats?.deviceType?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_device")}</Typography>
                                {adsStats?.device?.length ? (
                                    adsStats?.device?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                            <Box className="border border-1 p-2" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6">{text("view_ads_stats_country")}</Typography>
                                {adsStats?.country?.length ? (
                                    adsStats?.country?.map((item, index) => (
                                        <DataRow key={index} label={item.name || "Unknown"} value={item.count} labelConClassName="min-w-0" valueConClassName="min-w-0" />
                                    ))
                                ) : (
                                    <p>N/A</p>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
                mb: 2,
            }}>
                <FormFooter
                    loading={adsStatsLoading}
                    handleClose={onClose}
                    submitText={text("view_commitment_information_ok")}
                    cancelText={text("user_withdrawal_cancel")}
                    onSubmit={onClose}
                    showCancelButton={false}
                    sx={{ width: isMobile ? "120px" : "160px" }}
                />
            </Box>
        </CustomDialog>
    );
}

export default forwardRef(AdsManagementStatsModal);
