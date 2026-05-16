export declare enum AccountTypeEnum {
    PAY_NOW = "PAY_NOW",
    PAY_LATER = "PAY_LATER"
}
export declare class CreateAccountDto {
    name: string;
    type: AccountTypeEnum;
    openingBalance?: number;
    userId?: string;
}
export declare class UpdateAccountDto {
    name?: string;
    type?: AccountTypeEnum;
    isActive?: boolean;
}
