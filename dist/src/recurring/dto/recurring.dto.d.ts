export declare enum RecurringFrequencyEnum {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}
export declare enum RecurringTypeEnum {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
    TRANSFER = "TRANSFER"
}
export declare class CreateRecurringDto {
    accountId: string;
    categoryId?: string;
    type: RecurringTypeEnum;
    amount: number;
    frequency: RecurringFrequencyEnum;
    nextRunAt: string;
    endDate?: string;
    note?: string;
}
export declare class UpdateRecurringDto {
    accountId?: string;
    categoryId?: string;
    type?: RecurringTypeEnum;
    amount?: number;
    frequency?: RecurringFrequencyEnum;
    nextRunAt?: string;
    endDate?: string;
    active?: boolean;
    note?: string;
}
