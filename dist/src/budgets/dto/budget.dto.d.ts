export declare enum BudgetPeriodEnum {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    SALARY_CYCLE = "SALARY_CYCLE",
    CUSTOM = "CUSTOM"
}
export declare class CreateBudgetDto {
    categoryId?: string;
    periodType: BudgetPeriodEnum;
    limitAmount: number;
    startDate: string;
    endDate?: string;
}
export declare class UpdateBudgetDto {
    categoryId?: string;
    periodType?: BudgetPeriodEnum;
    limitAmount?: number;
    startDate?: string;
    endDate?: string;
}
