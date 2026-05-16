export declare class CreateEmiDto {
    name: string;
    accountId?: string;
    transactionId?: string;
    principal?: number;
    tenure?: number;
    amount?: number;
    monthlyEmi?: number;
    type?: string;
    startDate: string;
    endDate?: string;
    nextDueDate?: string;
    monthsPaid?: number;
}
export declare class UpdateEmiDto {
    name?: string;
    amount?: number;
    monthlyEmi?: number;
    nextDueDate?: string;
    active?: boolean;
}
