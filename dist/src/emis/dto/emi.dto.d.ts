export declare class CreateEmiDto {
    name: string;
    accountId: string;
    transactionId?: string;
    principal: number;
    tenure: number;
    monthlyEmi: number;
    startDate: string;
    nextDueDate: string;
}
export declare class UpdateEmiDto {
    name?: string;
    monthlyEmi?: number;
    nextDueDate?: string;
    active?: boolean;
}
