import { useLocale } from "locale";

const useDatepickerShortcuts = () => {
    const { text } = useLocale();

    const getStartDate = (num: number, isMonth?: boolean, isYear?: boolean) => {
        if (isYear) {
            return new Date(new Date().setFullYear(new Date().getFullYear() - num))
        }

        return isMonth ? new Date(new Date().setMonth(new Date().getMonth() - num)) :
            new Date(new Date().setDate(new Date().getDate() - num))
    };

    const customShortcuts = {
        last0Days: {
            text: text("today"),
            period: {
                start: new Date(),
                end: new Date()
            }
        },
        last1Days: {
            text: text("yesterday"),
            period: {
                start: getStartDate(1),
                end: getStartDate(1)
            },
        },
        last7Days: {
            text: text("last_7_days"),
            period: {
                start: getStartDate(7),
                end: new Date(),
            },
        },
        last14Days: {
            text: text("last_14_Days"),
            period: {
                start: getStartDate(14),
                end: new Date(),
            },
        },
        last30Days: {
            text: text("last_30_Days"),
            period: {
                start: getStartDate(30),
                end: new Date(),
            },
        },
        last3Months: {
            text: text("last_3_Months"),
            period: {
                start: getStartDate(3, true),
                end: new Date(),
            },
        },
        last6Months: {
            text: text("last_6_Months"),
            period: {
                start: getStartDate(6, true),
                end: new Date(),
            },
        },
        lastYear: {
            text: text("last_Year"),
            period: {
                start: getStartDate(1, false, true),
                end: new Date(),
            },
        },
    };

    return { customShortcuts }
};

export default useDatepickerShortcuts;