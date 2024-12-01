import React, { FC, useEffect, useState } from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { PieValueType } from "@mui/x-charts";
import useResponsive from "@common/hooks/useResponsive";

interface CitiesChartProps {
    cityData: PieValueType[];
}

const CitiesChart: FC<CitiesChartProps> = ({ cityData }) => {
    const [cityPage, setCityPage] = useState(1);
    const [selectedCities, setSelectedCities] = useState<PieValueType[]>([]);
    const { isMobile, isTablet, isBigScreen } = useResponsive();

    useEffect(() => {
        const startIndex = (cityPage - 1) * 12;
        const currentCities = cityData.length > 0 ? cityData.slice(startIndex, startIndex + 12) : [];
        setSelectedCities(currentCities);
    }, [cityPage, cityData]);

    return (
        <PieChart
            series={[
                {
                    arcLabel: (item) => `${item.label} (${item.value})`,
                    arcLabelMinAngle: 45,
                    data: cityData,
                    cx: "36%",
                },
            ]}
            sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                    fill: "white",
                    fontWeight: "bold",
                },
            }}
            slots={{
                legend: () => {
                    const totalPages = Math.ceil(cityData.length / 12);
                    const isNext = cityPage < totalPages;
                    const isPrev = cityPage > 1;
                    const colors = ["#02B2AF", "#2E96FF", "#B800D8", "#60009B", "#2731C8", "#03008D"];
                    return (
                        <g transform={`translate(${isMobile ? "320" : isTablet ? "510" : isBigScreen ? "430" : "750"}, ${isMobile ? "0" : "50"})`}>
                            {selectedCities.length > 0 && selectedCities.map((item: PieValueType, index: number) => {
                                return (
                                    <g key={item.id}>
                                        <rect x="0" y={`${15 + 20 * index}`} width="100" height="20" stroke="none" fillOpacity="0" fill="#ffffff"></rect>

                                        <g>
                                            <text x="20" y={`${30 + 20 * index}`} fontFamily="Arial" fontSize="12" stroke="none" fill="#222222">
                                                {`${item.label} (${item.value})`}
                                            </text>
                                        </g>

                                        <rect x="0" y={`${21 + 20 * index}`} width="10" height="10" fill={colors[index % 6]}></rect>
                                    </g>
                                );
                            })}
                            {cityData.length > 12 && (
                                <g>
                                    <path onClick={() => isPrev ? setCityPage(prev => prev - 1) : null} d="M12,282L6,270L0,282Z" stroke="none" strokeWidth="0" fill={isPrev ? "#0011cc" : "#cccccc"}  ></path>
                                    <g>
                                        <text textAnchor="middle" x="38" y="280.2" fontFamily="Arial" fontSize="12" stroke="none" strokeWidth="0" fill="#0011cc">{`${cityPage} / ${totalPages}`}</text>
                                    </g>
                                    <path onClick={() => isNext ? setCityPage(prev => prev + 1) : null} d="M64,270L76,270L70,282Z" stroke="none" strokeWidth="0" fill={isNext ? "#0011cc" : "#cccccc"}  ></path>
                                </g>
                            )}
                        </g>
                    );
                }
            }}
            height={isMobile ? 300 : 400}
        />
    );
};

export default CitiesChart;