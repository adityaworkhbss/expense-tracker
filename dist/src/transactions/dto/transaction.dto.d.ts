export declare enum TransactionTypeEnum {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
    TRANSFER = "TRANSFER"
}
export declare enum TransactionStatusEnum {
    PENDING = "PENDING",
    CLEARED = "CLEARED",
    REVERSED = "REVERSED"
}
export declare class CreateTransactionDto {
    type: TransactionTypeEnum;
    amount: number;
    transactionDate: string;
    accountId: string;
    categoryId?: string;
    transferToAccountId?: string;
    note?: string;
    merchant?: string;
    paymentMethod?: string;
    tags?: string[];
    status?: TransactionStatusEnum;
    isSalary?: boolean;
}
export declare class UpdateTransactionDto {
    type?: TransactionTypeEnum;
    amount?: number;
    transactionDate?: string;
    accountId?: string;
    categoryId?: string;
    transferToAccountId?: string;
    note?: string;
    merchant?: string;
    paymentMethod?: string;
    tags?: string[];
    status?: TransactionStatusEnum;
    isSalary?: boolean;
}
export declare class TransactionQueryDto {
    from?: string;
    to?: string;
    type?: TransactionTypeEnum;
    categoryId?: string;
    accountId?: string;
    page?: number;
    limit?: number;
}
