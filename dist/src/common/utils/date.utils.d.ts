export declare function getSalaryCycleDates(referenceDate?: Date, cycleDay?: number): {
    start: Date;
    end: Date;
};
export declare function getSalaryCycleForMonth(year: number, month: number, cycleDay?: number): {
    start: Date;
    end: Date;
};
export declare function getTodayRange(tz?: string): {
    start: Date;
    end: Date;
};
export declare function getThisWeekRange(tz?: string): {
    start: Date;
    end: Date;
};
export declare function getLastNDaysRange(n: number, tz?: string): {
    start: Date;
    end: Date;
};
export declare function getThisMonthRange(tz?: string): {
    start: Date;
    end: Date;
};
export declare function getDateRange(from: string, to: string, tz?: string): {
    start: Date;
    end: Date;
};
export declare function toISTDateString(date: Date): string;
export declare function toISTMonthKey(date: Date): string;
export declare function getSalaryCycleHistory(months: number, cycleDay?: number): Array<{
    start: Date;
    end: Date;
    label: string;
}>;
