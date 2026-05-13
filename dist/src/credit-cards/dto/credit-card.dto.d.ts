export declare class CreateCreditCardDto {
    cardName: string;
    accountId: string;
    limit: number;
    statementDate: number;
    dueDays: number;
}
export declare class UpdateCreditCardDto {
    cardName?: string;
    limit?: number;
    statementDate?: number;
    dueDays?: number;
}
